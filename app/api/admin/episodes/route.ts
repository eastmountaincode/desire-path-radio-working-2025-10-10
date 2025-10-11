import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

interface Guest {
  name: string
  organization: string
}

interface EpisodeData {
  title: string
  slug: string
  description: string
  aired_on: string
  audio_url: string
  image_url: string | null
  duration_seconds: number | null
  guests: Guest[]
  tag_ids: number[]
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

    const data: EpisodeData = await request.json()

    // Validate required fields
    if (!data.title || !data.slug || !data.aired_on || !data.audio_url) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, aired_on, audio_url' },
        { status: 400 }
      )
    }

    // Start a transaction-like process
    // We'll track what we've created so we can rollback if needed
    const createdGuestIds: number[] = []
    const createdEpisodeId: number | null = null

    try {
      // Step 1: Create or find guests
      const guestIds: number[] = []
      
      for (const guest of data.guests) {
        // Try to find existing guest by name
        const { data: existingGuest, error: findError } = await supabase
          .from('guests')
          .select('id')
          .eq('name', guest.name)
          .maybeSingle()

        if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
          throw new Error(`Failed to search for guest: ${findError.message}`)
        }

        if (existingGuest) {
          guestIds.push(existingGuest.id)
        } else {
          // Create new guest
          const { data: newGuest, error: createError } = await supabase
            .from('guests')
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
            guestIds.push(newGuest.id)
            createdGuestIds.push(newGuest.id)
          }
        }
      }

      // Step 2: Create episode
      const { data: episode, error: episodeError } = await supabase
        .from('episodes')
        .insert({
          title: data.title,
          slug: data.slug,
          description: data.description || null,
          aired_on: data.aired_on,
          audio_url: data.audio_url,
          image_url: data.image_url,
          duration_seconds: data.duration_seconds
        })
        .select('id')
        .single()

      if (episodeError) {
        throw new Error(`Failed to create episode: ${episodeError.message}`)
      }

      const episodeId = episode.id

      // Step 3: Link guests to episode
      if (guestIds.length > 0) {
        const episodeGuests = guestIds.map(guestId => ({
          episode_id: episodeId,
          guest_id: guestId
        }))

        const { error: guestsLinkError } = await supabase
          .from('episode_guests')
          .insert(episodeGuests)

        if (guestsLinkError) {
          throw new Error(`Failed to link guests: ${guestsLinkError.message}`)
        }
      }

      // Step 4: Link tags to episode
      if (data.tag_ids.length > 0) {
        const episodeTags = data.tag_ids.map(tagId => ({
          episode_id: episodeId,
          tag_id: tagId
        }))

        const { error: tagsLinkError } = await supabase
          .from('episode_tags')
          .insert(episodeTags)

        if (tagsLinkError) {
          throw new Error(`Failed to link tags: ${tagsLinkError.message}`)
        }
      }

      return NextResponse.json({
        success: true,
        episode_id: episodeId
      })

    } catch (error) {
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

