import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

interface EpisodeWithRelations {
  id: number
  title: string
  slug: string
  description: string | null
  aired_on: string
  location: string | null
  audio_url: string
  image_url: string | null
  duration_seconds: number | null
  play_count: number
  status: 'draft' | 'published'
  test_type: 'none' | 'jest' | 'manual'
  hosts: Array<{
    id: number
    name: string
    organization: string | null
  }>
  tags: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
  created_at: string
}

interface EpisodeQueryResult {
  id: number
  title: string
  slug: string
  description: string | null
  aired_on: string
  location: string | null
  audio_url: string
  image_url: string | null
  duration_seconds: number | null
  play_count: number
  status: 'draft' | 'published'
  test_type: 'none' | 'jest' | 'manual'
  created_at: string
  episode_hosts?: Array<{
    hosts: {
      id: number
      name: string
      organization: string | null
    }
  }>
  episode_tags?: Array<{
    tags: {
      id: number
      name: string
      slug: string
      type: string
    }
  }>
}

// GET - Fetch episode by ID for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const episodeId = parseInt(id)

    if (isNaN(episodeId)) {
      return NextResponse.json(
        { error: 'Invalid episode ID' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Fetch episode with all relations
    const { data: episodes, error } = await supabase
      .from('episodes')
      .select(`
        id,
        title,
        slug,
        description,
        aired_on,
        location,
        audio_url,
        image_url,
        duration_seconds,
        play_count,
        status,
        test_type,
        created_at,
        episode_hosts (
          hosts (
            id,
            name,
            organization
          )
        ),
        episode_tags (
          tags (
            id,
            name,
            slug,
            type
          )
        )
      `)
      .eq('id', episodeId)
      .limit(1) as { data: EpisodeQueryResult[] | null, error: unknown }

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch episode' },
        { status: 500 }
      )
    }

    if (!episodes || episodes.length === 0) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      )
    }

    // Transform the data to flatten the nested structure
    const episode: EpisodeWithRelations = {
      id: episodes[0].id,
      title: episodes[0].title,
      slug: episodes[0].slug,
      description: episodes[0].description,
      aired_on: episodes[0].aired_on,
      location: episodes[0].location,
      audio_url: episodes[0].audio_url,
      image_url: episodes[0].image_url,
      duration_seconds: episodes[0].duration_seconds,
      play_count: episodes[0].play_count || 0,
      status: episodes[0].status,
      test_type: episodes[0].test_type,
      created_at: episodes[0].created_at,
      hosts: episodes[0].episode_hosts?.map((eh) => eh.hosts) || [],
      tags: episodes[0].episode_tags?.map((et) => et.tags) || []
    }

    return NextResponse.json({ episode })

  } catch (error) {
    console.error('Episode fetch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update episode
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const episodeId = parseInt(id)

    if (isNaN(episodeId)) {
      return NextResponse.json(
        { error: 'Invalid episode ID' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Fetch existing episode to get current file URLs and keys
    const { data: existingEpisode, error: fetchError } = await supabase
      .from('episodes')
      .select('audio_url, image_url')
      .eq('id', episodeId)
      .single()

    if (fetchError || !existingEpisode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      )
    }

    const episodeData = await request.json()

    // Determine final URLs - use new ones if provided, otherwise keep existing
    let audioUrl = episodeData.audio_url || (existingEpisode as { audio_url: string; image_url: string | null }).audio_url
    let imageUrl = episodeData.image_url !== undefined ? episodeData.image_url : (existingEpisode as { audio_url: string; image_url: string | null }).image_url
    
    // Track old files for cleanup if new ones were uploaded
    let oldAudioKey: string | null = null
    let oldImageKey: string | null = null

    // If new audio was uploaded, mark old one for deletion
    if (episodeData.audio_url && episodeData.audio_url !== (existingEpisode as { audio_url: string; image_url: string | null }).audio_url) {
      oldAudioKey = (existingEpisode as { audio_url: string; image_url: string | null }).audio_url.split('/').pop() || null
    }

    // If new image was uploaded, mark old one for deletion
    if (episodeData.image_url && episodeData.image_url !== (existingEpisode as { audio_url: string; image_url: string | null }).image_url) {
      const existingImageUrl = (existingEpisode as { audio_url: string; image_url: string | null }).image_url
      oldImageKey = existingImageUrl ? existingImageUrl.split('/').pop() || null : null
    }

    // Update episode
    const { error: updateError } = await supabase
      .from('episodes')
      .update({
        title: episodeData.title,
        description: episodeData.description || null,
        aired_on: episodeData.aired_on,
        location: episodeData.location || null,
        audio_url: audioUrl,
        image_url: imageUrl,
        duration_seconds: episodeData.duration_seconds,
        test_type: episodeData.test_type || 'none',
        status: episodeData.status || 'published',
      } as never)
      .eq('id', episodeId)
      .select('id')
      .single()

    if (updateError) {
      console.error('Episode update error:', updateError)
      // Rollback: delete newly uploaded files
      if (episodeData.audio_key) {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_AUDIO_BUCKET_NAME!,
          Key: episodeData.audio_key
        })).catch(() => {})
      }
      if (episodeData.image_key) {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_IMAGES_BUCKET_NAME!,
          Key: episodeData.image_key
        })).catch(() => {})
      }
      return NextResponse.json(
        { error: 'Failed to update episode' },
        { status: 500 }
      )
    }

    // Delete old episode_hosts relationships
    await supabase
      .from('episode_hosts')
      .delete()
      .eq('episode_id', episodeId)

    // Handle hosts (create if needed, then link)
    const hostIds: number[] = []
    for (const host of episodeData.hosts) {
      const { data: existingHost } = await supabase
        .from('hosts')
        .select('id')
        .eq('name', host.name)
        .eq('organization', host.organization || null)
        .single()

      if (existingHost) {
        hostIds.push((existingHost as { id: number }).id)
      } else {
        const { data: newHost, error: hostError } = await supabase
          .from('hosts')
          .insert({ name: host.name, organization: host.organization || null } as never)
          .select('id')
          .single()

        if (hostError || !newHost) {
          console.error('Host creation error:', hostError)
          continue
        }
        hostIds.push((newHost as { id: number }).id)
      }
    }

    // Link hosts to episode
    if (hostIds.length > 0) {
      await supabase
        .from('episode_hosts')
        .insert(hostIds.map(hostId => ({ episode_id: episodeId, host_id: hostId })) as never)
    }

    // Delete old episode_tags relationships
    await supabase
      .from('episode_tags')
      .delete()
      .eq('episode_id', episodeId)

    // Handle tags (create if needed, then link)
    const tagIds: number[] = []
    for (const tag of episodeData.tags) {
      const tagSlug = tag.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')

      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('type', tag.type)
        .eq('name', tag.value)
        .single()

      if (existingTag) {
        tagIds.push((existingTag as { id: number }).id)
      } else {
        const { data: newTag, error: tagError } = await supabase
          .from('tags')
          .insert({ type: tag.type, name: tag.value, slug: tagSlug } as never)
          .select('id')
          .single()

        if (tagError || !newTag) {
          console.error('Tag creation error:', tagError)
          continue
        }
        tagIds.push((newTag as { id: number }).id)
      }
    }

    // Link tags to episode
    if (tagIds.length > 0) {
      await supabase
        .from('episode_tags')
        .insert(tagIds.map(tagId => ({ episode_id: episodeId, tag_id: tagId })) as never)
    }

    // Delete old files from R2 after successful update
    if (oldAudioKey) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_AUDIO_BUCKET_NAME!,
        Key: oldAudioKey
      })).catch((err) => console.error('Failed to delete old audio:', err))
    }

    if (oldImageKey) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_IMAGES_BUCKET_NAME!,
        Key: oldImageKey
      })).catch((err) => console.error('Failed to delete old image:', err))
    }

    return NextResponse.json({
      success: true,
      message: 'Episode updated successfully',
      episodeId: episodeId
    })

  } catch (error) {
    console.error('Episode update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete episode
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const episodeId = parseInt(id)

    if (isNaN(episodeId)) {
      return NextResponse.json(
        { error: 'Invalid episode ID' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Fetch episode to get file URLs before deletion
    const { data: episode, error: fetchError } = await supabase
      .from('episodes')
      .select('audio_url, image_url, title')
      .eq('id', episodeId)
      .single()

    if (fetchError || !episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      )
    }

    // Delete episode from database (CASCADE will handle episode_hosts and episode_tags)
    const { error: deleteError } = await supabase
      .from('episodes')
      .delete()
      .eq('id', episodeId)

    if (deleteError) {
      console.error('Episode deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete episode' },
        { status: 500 }
      )
    }

    // Delete audio file from R2 if it exists
    if ((episode as { audio_url: string; image_url: string | null }).audio_url) {
      try {
        const audioKey = (episode as { audio_url: string; image_url: string | null }).audio_url.split('/').pop()
        if (audioKey) {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_AUDIO_BUCKET_NAME!,
            Key: audioKey
          }))
        }
      } catch (error) {
        console.error('Failed to delete audio file from R2:', error)
        // Don't fail the request if R2 deletion fails
      }
    }

    // Delete image file from R2 if it exists
    if ((episode as { audio_url: string; image_url: string | null }).image_url) {
      try {
        const imageKey = (episode as { audio_url: string; image_url: string | null }).image_url!.split('/').pop()
        if (imageKey) {
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.R2_IMAGES_BUCKET_NAME!,
            Key: imageKey
          }))
        }
      } catch (error) {
        console.error('Failed to delete image file from R2:', error)
        // Don't fail the request if R2 deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Episode deleted successfully',
      deletedEpisode: {
        id: episodeId,
        title: (episode as { audio_url: string; image_url: string | null; title: string }).title
      }
    })

  } catch (error) {
    console.error('Episode deletion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
