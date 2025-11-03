import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

interface Host {
  name: string
  organization: string
}

interface Tag {
  type: string
  value: string
}

interface EpisodeData {
  title: string
  slug: string
  description: string
  aired_on: string
  location: string
  audio_url?: string | null
  audio_key?: string | null
  image_url?: string | null
  image_key?: string | null
  duration_seconds: number | null
  hosts: Host[]
  tags: Tag[]
  test_type: 'none' | 'jest' | 'manual'
  status?: 'draft' | 'published'
}

// Helper function to create a slug from a string
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper function to delete from R2
async function deleteFromR2(bucketName: string, key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  await r2Client.send(command)
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const episodeData: EpisodeData = await request.json()
    const supabase = await createServerSupabase()

    console.log(episodeData)

    // Track what we've created for rollback
    const createdR2Files: Array<{ bucket: string, key: string }> = []
    const createdHostIds: number[] = []
    const createdTagIds: number[] = []
    let createdEpisodeId: number | null = null

    try {
      // Files are already uploaded to R2 by the client
      // We just need to track them for potential rollback
      if (episodeData.audio_key) {
        createdR2Files.push({ 
          bucket: process.env.R2_AUDIO_BUCKET_NAME!, 
          key: episodeData.audio_key 
        })
      }
      if (episodeData.image_key) {
        createdR2Files.push({ 
          bucket: process.env.R2_IMAGES_BUCKET_NAME!, 
          key: episodeData.image_key 
        })
      }

      // Step 3: Create hosts
      const hostIds: number[] = []

      for (const host of episodeData.hosts) {
        // Try to find existing host by name AND organization (both must match)
        let query = supabase
          .from('hosts')
          .select('id')
          .eq('name', host.name)

        // Add organization filter - handle both null and string values
        if (host.organization) {
          query = query.eq('organization', host.organization)
        } else {
          query = query.is('organization', null)
        }

        const { data: existingHost, error: findError } = await query
          .maybeSingle() as { data: { id: number } | null; error: { code?: string; message: string } | null }

        if (findError && findError.code !== 'PGRST116') {
          throw new Error(`Failed to search for host: ${findError.message}`)
        }

        if (existingHost) {
          // Found exact match (same name and organization)
          hostIds.push(existingHost.id)
        } else {
          // Create new host (different name or different organization)
          const { data: newHost, error: createError } = await supabase
            .from('hosts')
            // @ts-expect-error - Supabase type inference issue with insert
            .insert({
              name: host.name,
              organization: host.organization || null
            })
            .select('id')
            .single() as { data: { id: number } | null; error: { message: string } | null }

          if (createError) {
            throw new Error(`Failed to create host: ${createError.message}`)
          }

          if (newHost) {
            hostIds.push(newHost.id)
            createdHostIds.push(newHost.id)
          }
        }
      }

      // Step 2: Create episode (with unique slug handling)
      let episodeSlug = episodeData.slug
      let slugSuffix = 1

      // Keep trying to create episode until we find a unique slug
      while (true) {
        const { data: episode, error: episodeError } = await supabase
          .from('episodes')
          // @ts-expect-error - Supabase type inference issue with insert
          .insert({
            title: episodeData.title,
            slug: episodeSlug,
            description: episodeData.description || null,
            aired_on: episodeData.aired_on,
            location: episodeData.location || null,
            audio_url: episodeData.audio_url || null,
            image_url: episodeData.image_url || null,
            duration_seconds: episodeData.duration_seconds,
            test_type: episodeData.test_type,
            status: episodeData.status || 'published'
          })
          .select('id')
          .single() as { data: { id: number } | null; error: { code?: string; message: string } | null }

        if (episodeError) {
          // Check if it's a duplicate slug error
          if (episodeError.code === '23505' && episodeError.message.includes('episodes_slug_key')) {
            // Generate new slug with suffix
            episodeSlug = `${episodeData.slug}-${slugSuffix}`
            slugSuffix++
            continue // Retry with new slug
          } else {
            throw new Error(`Failed to create episode: ${episodeError.message}`)
          }
        }

        createdEpisodeId = episode!.id
        break // Success, exit the loop
      }

      // Step 5: Link hosts to episode
      if (hostIds.length > 0) {
        const episodeHosts = hostIds.map(hostId => ({
          episode_id: createdEpisodeId,
          host_id: hostId
        }))

        const { error: hostsLinkError } = await supabase
          .from('episode_hosts')
          // @ts-expect-error - Supabase type inference issue with insert
          .insert(episodeHosts)

        if (hostsLinkError) {
          throw new Error(`Failed to link hosts: ${hostsLinkError.message}`)
        }
      }

      // Step 6: Create or find tags
      const tagIds: number[] = []

      for (const tag of episodeData.tags) {
        const tagType = tag.type.toUpperCase()
        const normalizedTagName = tag.value.trim()
        const tagSlug = createSlug(`${tagType.toLowerCase()}-${normalizedTagName}`)

        console.log(`Looking for tag: type="${tagType}", name="${normalizedTagName}", slug="${tagSlug}"`)

        // Try to find existing tag by type and value
        const { data: existingTag, error: findError } = await supabase
          .from('tags')
          .select('id, name, type, slug')
          .eq('type', tagType)
          .eq('name', normalizedTagName)
          .maybeSingle() as { data: { id: number; name: string; type: string; slug: string } | null; error: { code?: string; message: string } | null }

        console.log('Tag lookup result:', { existingTag, findError })

        if (findError && findError.code !== 'PGRST116') {
          console.error('Tag lookup error:', findError)
          throw new Error(`Failed to search for tag: ${findError.message}`)
        }

        if (existingTag) {
          console.log(`Found existing tag with ID: ${existingTag.id}`)
          // Use existing tag
          tagIds.push(existingTag.id)
        } else {
          console.log(`Creating new tag: ${tag.value} (${tagType})`)
          // Create new tag
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            // @ts-expect-error - Supabase type inference issue with insert
            .insert({
              name: normalizedTagName,
              slug: tagSlug,
              type: tagType
            })
            .select('id')
            .single() as { data: { id: number } | null; error: { message: string } | null }

          if (createError) {
            console.error('Tag creation error:', createError)
            throw new Error(`Failed to create tag: ${createError.message}`)
          }

          if (newTag) {
            console.log(`Created new tag with ID: ${newTag.id}`)
            tagIds.push(newTag.id)
            createdTagIds.push(newTag.id)
          }
        }
      }

      // Step 7: Link tags to episode
      if (tagIds.length > 0) {
        const episodeTags = tagIds.map(tagId => ({
          episode_id: createdEpisodeId,
          tag_id: tagId
        }))

        const { error: tagsLinkError } = await supabase
          .from('episode_tags')
          // @ts-expect-error - Supabase type inference issue with insert
          .insert(episodeTags)

        if (tagsLinkError) {
          throw new Error(`Failed to link tags: ${tagsLinkError.message}`)
        }
      }

      return NextResponse.json({
        success: true,
        episode_id: createdEpisodeId,
        episode_slug: episodeSlug,
        message: 'Episode created successfully'
      })

    } catch (error) {
      // Rollback: Delete files from R2
      for (const { bucket, key } of createdR2Files) {
        try {
          await deleteFromR2(bucket, key)
        } catch (deleteError) {
          console.error('Failed to delete R2 file during rollback:', deleteError)
        }
      }

      // Rollback: Delete episode if it was created
      if (createdEpisodeId) {
        await supabase
          .from('episodes')
          .delete()
          .eq('id', createdEpisodeId)
      }

      // Rollback: Delete newly created hosts
      if (createdHostIds.length > 0) {
        await supabase
          .from('hosts')
          .delete()
          .in('id', createdHostIds)
      }

      // Rollback: Delete newly created tags
      if (createdTagIds.length > 0) {
        await supabase
          .from('tags')
          .delete()
          .in('id', createdTagIds)
      }

      throw error
    }

  } catch (error) {
    console.error('Episode creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create episode' },
      { status: 500 }
    )
  }
}

// DELETE - Clear specific tables
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tableToClear = searchParams.get('table')

    if (!tableToClear || !['episodes', 'hosts', 'tags'].includes(tableToClear)) {
      return NextResponse.json(
        { error: 'Invalid or missing table parameter. Use ?table=episodes, ?table=hosts, or ?table=tags' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()
    let message = ''

    if (tableToClear === 'episodes') {
      // Delete all episodes - CASCADE will handle episode_hosts and episode_tags automatically
      const { error: deleteError } = await supabase
        .from('episodes')
        .delete()
        .neq('id', 0) // This deletes all rows

      if (deleteError) {
        throw new Error(`Failed to delete episodes: ${deleteError.message}`)
      }
      message = 'All episodes and related data cleared successfully'
    } else if (tableToClear === 'hosts') {
      // Delete all hosts - CASCADE will handle episode_hosts automatically
      const { error: deleteError } = await supabase
        .from('hosts')
        .delete()
        .neq('id', 0) // This deletes all rows

      if (deleteError) {
        throw new Error(`Failed to delete hosts: ${deleteError.message}`)
      }
      message = 'All hosts cleared successfully'
    } else if (tableToClear === 'tags') {
      // Delete all tags - CASCADE will handle episode_tags automatically
      const { error: deleteError } = await supabase
        .from('tags')
        .delete()
        .neq('id', 0) // This deletes all rows

      if (deleteError) {
        throw new Error(`Failed to delete tags: ${deleteError.message}`)
      }
      message = 'All tags cleared successfully'
    }

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('Database clear error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clear database' },
      { status: 500 }
    )
  }
}
