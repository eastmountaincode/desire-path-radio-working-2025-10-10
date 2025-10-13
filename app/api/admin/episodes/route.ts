import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Database } from '@/types/database'

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

interface Guest {
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
  audio_url?: string | null
  image_url?: string | null
  duration_seconds: number | null
  guests: Guest[]
  tags: Tag[]
  test_type: 'none' | 'jest' | 'manual'
}

// Helper function to create a slug from a string
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Helper function to upload file to R2 and return public URL
async function uploadToR2(file: File, bucketName: string, fileName: string): Promise<{ publicUrl: string, key: string, attempts: number }> {
  const timestamp = Date.now()
  const sanitizedName = fileName.replace(/[^a-z0-9.-]/gi, '-')
  const key = `${timestamp}-${sanitizedName}`

  // Create presigned URL for upload
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: file.type,
  })

  const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })

  // Upload file using presigned URL with retry logic
  let uploadResponse: Response
  const maxRetries = 3
  let lastError: Error | null = null
  let attempts = 0

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    attempts = attempt
    try {
      uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (uploadResponse.ok) {
        break
      } else {
        throw new Error(`Upload failed with status ${uploadResponse.status}`)
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown upload error')

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }

      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
    }
  }

  // Construct public URL based on bucket
  let publicUrl: string
  if (bucketName === process.env.R2_AUDIO_BUCKET_NAME) {
    publicUrl = `${process.env.R2_AUDIO_PUBLIC_URL}/${key}`
  } else if (bucketName === process.env.R2_IMAGES_BUCKET_NAME) {
    publicUrl = `${process.env.R2_IMAGES_PUBLIC_URL}/${key}`
  } else {
    throw new Error(`Unknown bucket: ${bucketName}`)
  }

  return { publicUrl, key, attempts }
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

    const formData = await request.formData()
    const supabase = await createServerSupabase()

    // Parse episode data from form
    const episodeData: EpisodeData = JSON.parse(formData.get('episodeData') as string)

    console.log(episodeData)

    // Get uploaded files
    const audioFile = formData.get('audioFile') as File | null
    const imageFile = formData.get('imageFile') as File | null

    // Track what we've created for rollback
    const createdR2Files: Array<{ bucket: string, key: string }> = []
    const createdGuestIds: number[] = []
    const createdTagIds: number[] = []
    let createdEpisodeId: number | null = null

    // Track upload attempts
    let audioAttempts = 0
    let imageAttempts = 0

    try {
      // Step 1: Upload audio file (if provided)
      let audioUrl: string | null = null
      if (audioFile) {
        const audioBucket = process.env.R2_AUDIO_BUCKET_NAME!
        const { publicUrl, key, attempts } = await uploadToR2(audioFile, audioBucket, audioFile.name)
        audioUrl = publicUrl
        audioAttempts = attempts
        createdR2Files.push({ bucket: audioBucket, key })
      }

      // Step 2: Upload image file (if provided)
      let imageUrl: string | null = null
      if (imageFile) {
        const imageBucket = process.env.R2_IMAGES_BUCKET_NAME!
        const { publicUrl, key, attempts } = await uploadToR2(imageFile, imageBucket, imageFile.name)
        imageUrl = publicUrl
        imageAttempts = attempts
        createdR2Files.push({ bucket: imageBucket, key })
      }

      // Step 3: Create guests
      const guestIds: number[] = []

      for (const guest of episodeData.guests) {
        // Try to find existing guest by name
        const { data: existingGuest, error: findError } = await supabase
          .from('guests')
          .select('id')
          .eq('name', guest.name)
          .maybeSingle()

        if (findError && findError.code !== 'PGRST116') {
          throw new Error(`Failed to search for guest: ${findError.message}`)
        }

        if (existingGuest) {
          // @ts-ignore
          guestIds.push(existingGuest.id)
        } else {
          // Create new guest
          const { data: newGuest, error: createError } = await supabase
            .from('guests')
            // @ts-ignore - Supabase type inference issue
            .insert({
              name: guest.name,
              organization: guest.organization || null
            })
            .select('id')
            .single()

          if (createError) {
            throw new Error(`Failed to create guest: ${createError.message}`)
          }

          if (newGuest) {
            // @ts-ignore
            guestIds.push(newGuest.id)
            // @ts-ignore
            createdGuestIds.push(newGuest.id)
          }
        }
      }

      // Step 4: Create episode (with unique slug handling)
      let episodeSlug = episodeData.slug
      let slugSuffix = 1

      // Keep trying to create episode until we find a unique slug
      while (true) {
        const { data: episode, error: episodeError } = await supabase
          .from('episodes')
          // @ts-ignore - Supabase type inference issue
          .insert({
            title: episodeData.title,
            slug: episodeSlug,
            description: episodeData.description || null,
            aired_on: episodeData.aired_on,
            audio_url: audioUrl,
            image_url: imageUrl,
            duration_seconds: episodeData.duration_seconds,
            test_type: episodeData.test_type
          })
          .select('id')
          .single()

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

        // @ts-ignore
        createdEpisodeId = episode.id
        break // Success, exit the loop
      }

      // Step 5: Link guests to episode
      if (guestIds.length > 0) {
        const episodeGuests = guestIds.map(guestId => ({
          episode_id: createdEpisodeId,
          guest_id: guestId
        }))

        const { error: guestsLinkError } = await supabase
          .from('episode_guests')
          // @ts-ignore - Supabase type inference issue
          .insert(episodeGuests)

        if (guestsLinkError) {
          throw new Error(`Failed to link guests: ${guestsLinkError.message}`)
        }
      }

      // Step 6: Create or find tags
      const tagIds: number[] = []

      for (const tag of episodeData.tags) {
        const tagSlug = createSlug(tag.value)
        const tagType = tag.type.toUpperCase()

        // Try to find existing tag by type and value
        const { data: existingTag, error: findError } = await supabase
          .from('tags')
          .select('id')
          .eq('type', tagType)
          .eq('name', tag.value)
          .maybeSingle()

        if (findError && findError.code !== 'PGRST116') {
          throw new Error(`Failed to search for tag: ${findError.message}`)
        }

        if (existingTag) {
          // @ts-ignore
          tagIds.push(existingTag.id)
        } else {
          // Create new tag
          const { data: newTag, error: createError } = await supabase
            .from('tags')
            // @ts-ignore - Supabase type inference issue
            .insert({
              name: tag.value,
              slug: tagSlug,
              type: tagType
            })
            .select('id')
            .single()

          if (createError) {
            throw new Error(`Failed to create tag: ${createError.message}`)
          }

          if (newTag) {
            // @ts-ignore
            tagIds.push(newTag.id)
            // @ts-ignore
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
          // @ts-ignore - Supabase type inference issue
          .insert(episodeTags)

        if (tagsLinkError) {
          throw new Error(`Failed to link tags: ${tagsLinkError.message}`)
        }
      }

      return NextResponse.json({
        success: true,
        episode_id: createdEpisodeId,
        episode_slug: episodeSlug,
        upload_attempts: {
          audio: audioAttempts || 0,
          image: imageAttempts || 0
        },
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

      // Rollback: Delete newly created guests
      if (createdGuestIds.length > 0) {
        await supabase
          .from('guests')
          .delete()
          .in('id', createdGuestIds)
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

    if (!tableToClear || !['episodes', 'guests', 'tags'].includes(tableToClear)) {
      return NextResponse.json(
        { error: 'Invalid or missing table parameter. Use ?table=episodes, ?table=guests, or ?table=tags' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()
    let message = ''

    if (tableToClear === 'episodes') {
      // Delete all episodes - CASCADE will handle episode_guests and episode_tags automatically
      const { error: deleteError } = await supabase
        .from('episodes')
        .delete()
        .neq('id', 0) // This deletes all rows

      if (deleteError) {
        throw new Error(`Failed to delete episodes: ${deleteError.message}`)
      }
      message = 'All episodes and related data cleared successfully'
    } else if (tableToClear === 'guests') {
      // Delete all guests - CASCADE will handle episode_guests automatically
      const { error: deleteError } = await supabase
        .from('guests')
        .delete()
        .neq('id', 0) // This deletes all rows

      if (deleteError) {
        throw new Error(`Failed to delete guests: ${deleteError.message}`)
      }
      message = 'All guests cleared successfully'
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
