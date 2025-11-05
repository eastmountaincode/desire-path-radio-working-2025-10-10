import { NextResponse } from 'next/server'
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

interface Episode {
  audio_url: string
  image_url: string | null
}

// Helper function to extract R2 key from public URL
function extractKeyFromUrl(url: string): string | null {
  if (!url) return null

  try {
    // URLs are in format: https://proxy-url/key-name
    const urlParts = url.split('/')
    return urlParts[urlParts.length - 1]
  } catch (error) {
    console.error('Error extracting key from URL:', error)
    return null
  }
}

// Helper function to delete from R2
async function deleteFromR2(bucketName: string, key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
    await s3Client.send(command)
    return true
  } catch (error) {
    console.error(`Error deleting ${key} from ${bucketName}:`, error)
    return false
  }
}

// POST - Clear database and object storage (excluding schedule image)
export async function POST() {
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

    const supabase = await createServerSupabase()

    // Track deletion results
    const results = {
      episodes_deleted: 0,
      audio_files_deleted: 0,
      audio_files_failed: 0,
      image_files_deleted: 0,
      image_files_failed: 0,
      hosts_deleted: 0,
      tags_deleted: 0,
      highlights_cleared: 0,
      errors: [] as string[],
    }

    // Step 1: Fetch all episodes to get their audio and image URLs
    const { data: episodes, error: fetchError } = await supabase
      .from('episodes')
      .select('audio_url, image_url')

    if (fetchError) {
      console.error('Error fetching episodes:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch episodes', details: fetchError.message },
        { status: 500 }
      )
    }

    // Step 2: Delete all audio and image files from R2
    if (episodes && episodes.length > 0) {
      const audioBucket = process.env.R2_AUDIO_BUCKET_NAME!
      const imageBucket = process.env.R2_IMAGES_BUCKET_NAME!

      for (const episode of episodes as Episode[]) {
        // Delete audio file
        if (episode.audio_url) {
          const audioKey = extractKeyFromUrl(episode.audio_url)
          if (audioKey) {
            const success = await deleteFromR2(audioBucket, audioKey)
            if (success) {
              results.audio_files_deleted++
            } else {
              results.audio_files_failed++
              results.errors.push(`Failed to delete audio: ${audioKey}`)
            }
          }
        }

        // Delete image file
        if (episode.image_url) {
          const imageKey = extractKeyFromUrl(episode.image_url)
          if (imageKey) {
            const success = await deleteFromR2(imageBucket, imageKey)
            if (success) {
              results.image_files_deleted++
            } else {
              results.image_files_failed++
              results.errors.push(`Failed to delete image: ${imageKey}`)
            }
          }
        }
      }
    }

    // Step 3: Clear episode_highlights table
    // First check if there are any highlights
    const { data: existingHighlights } = await supabase
      .from('episode_highlights')
      .select('id')

    if (existingHighlights && existingHighlights.length > 0) {
      const { error: highlightsError } = await supabase
        .from('episode_highlights')
        .delete()
        .neq('id', 0) // Delete all rows

      if (highlightsError) {
        console.error('Error clearing episode_highlights:', highlightsError)
        results.errors.push(`Failed to clear highlights: ${highlightsError.message}`)
      } else {
        results.highlights_cleared = existingHighlights.length
      }
    }

    // Step 4: Delete all episodes (CASCADE will handle episode_hosts and episode_tags)
    const { error: deleteError } = await supabase
      .from('episodes')
      .delete()
      .neq('id', 0) // Delete all rows

    if (deleteError) {
      console.error('Error deleting episodes:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete episodes', details: deleteError.message },
        { status: 500 }
      )
    }

    results.episodes_deleted = episodes ? episodes.length : 0

    // Step 5: Delete orphaned hosts (hosts with no episodes)
    // First, get all host IDs that are still referenced in episode_hosts
    const { data: referencedHostIds, error: referencedHostsError } = await supabase
      .from('episode_hosts')
      .select('host_id')

    if (referencedHostsError) {
      console.error('Error fetching referenced hosts:', referencedHostsError)
      results.errors.push(`Failed to fetch referenced hosts: ${referencedHostsError.message}`)
    } else {
      // Get all hosts
      const { data: allHosts, error: allHostsError } = await supabase
        .from('hosts')
        .select('id')

      if (allHostsError) {
        console.error('Error fetching all hosts:', allHostsError)
        results.errors.push(`Failed to fetch all hosts: ${allHostsError.message}`)
      } else if (allHosts) {
        const referencedIds = new Set(referencedHostIds?.map((h: { host_id: number }) => h.host_id) || [])
        const orphanedHostIds = allHosts
          .filter((h: { id: number }) => !referencedIds.has(h.id))
          .map((h: { id: number }) => h.id)

        if (orphanedHostIds.length > 0) {
          const { error: deleteHostsError } = await supabase
            .from('hosts')
            .delete()
            .in('id', orphanedHostIds)

          if (deleteHostsError) {
            console.error('Error deleting orphaned hosts:', deleteHostsError)
            results.errors.push(`Failed to delete orphaned hosts: ${deleteHostsError.message}`)
          } else {
            results.hosts_deleted = orphanedHostIds.length
          }
        }
      }
    }

    // Step 6: Delete orphaned tags (tags with no episodes)
    // First, get all tag IDs that are still referenced in episode_tags
    const { data: referencedTagIds, error: referencedTagsError } = await supabase
      .from('episode_tags')
      .select('tag_id')

    if (referencedTagsError) {
      console.error('Error fetching referenced tags:', referencedTagsError)
      results.errors.push(`Failed to fetch referenced tags: ${referencedTagsError.message}`)
    } else {
      // Get all tags
      const { data: allTags, error: allTagsError } = await supabase
        .from('tags')
        .select('id')

      if (allTagsError) {
        console.error('Error fetching all tags:', allTagsError)
        results.errors.push(`Failed to fetch all tags: ${allTagsError.message}`)
      } else if (allTags) {
        const referencedIds = new Set(referencedTagIds?.map((t: { tag_id: number }) => t.tag_id) || [])
        const orphanedTagIds = allTags
          .filter((t: { id: number }) => !referencedIds.has(t.id))
          .map((t: { id: number }) => t.id)

        if (orphanedTagIds.length > 0) {
          const { error: deleteTagsError } = await supabase
            .from('tags')
            .delete()
            .in('id', orphanedTagIds)

          if (deleteTagsError) {
            console.error('Error deleting orphaned tags:', deleteTagsError)
            results.errors.push(`Failed to delete orphaned tags: ${deleteTagsError.message}`)
          } else {
            results.tags_deleted = orphanedTagIds.length
          }
        }
      }
    }

    // Log the action to admin_logs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('admin_logs') as any).insert({
      event_type: 'database_clear',
      status: results.errors.length === 0 ? 'success' : 'partial_success',
      message: `Cleared database: ${results.episodes_deleted} episodes, ${results.audio_files_deleted} audio files, ${results.image_files_deleted} image files, ${results.hosts_deleted} hosts, ${results.tags_deleted} tags`,
    })

    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully',
      results,
    })

  } catch (error) {
    console.error('Error clearing database:', error)
    return NextResponse.json(
      {
        error: 'Failed to clear database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
