import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

interface HighlightData {
  episode_id: number
  display_order: number
  episodes: {
    id: number
    title: string
    slug: string
    description: string | null
    aired_on: string
    audio_url: string
    image_url: string | null
    duration_seconds: number | null
  }
}

interface HostData {
  hosts: {
    id: number
    name: string
    organization: string | null
  }
}

interface TagData {
  tags: {
    id: number
    name: string
    slug: string
    type: string
  }
}

// GET - Fetch highlighted episodes for public display
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    // Fetch highlights with full episode details including hosts and tags
    const { data: highlights, error } = await supabase
      .from('episode_highlights')
      .select(`
        episode_id,
        display_order,
        episodes (
          id,
          title,
          slug,
          description,
          aired_on,
          audio_url,
          image_url,
          duration_seconds
        )
      `)
      .order('display_order', { ascending: true })
      .limit(5)

    if (error) {
      console.error('Failed to fetch highlights:', error)
      return NextResponse.json(
        { error: 'Failed to fetch highlights' },
        { status: 500 }
      )
    }

    // Fetch hosts and tags for each episode
    const episodesWithDetails = await Promise.all(
      (highlights || []).map(async (highlight: HighlightData) => {
        const episode = highlight.episodes

        // Fetch hosts
        const { data: hostsData } = await supabase
          .from('episode_hosts')
          .select(`
            hosts (
              id,
              name,
              organization
            )
          `)
          .eq('episode_id', episode.id)

        // Fetch tags
        const { data: tagsData } = await supabase
          .from('episode_tags')
          .select(`
            tags (
              id,
              name,
              slug,
              type
            )
          `)
          .eq('episode_id', episode.id)

        return {
          ...episode,
          hosts: (hostsData as HostData[] | null)?.map((h) => h.hosts) || [],
          tags: (tagsData as TagData[] | null)?.map((t) => t.tags) || []
        }
      })
    )

    return NextResponse.json({
      episodes: episodesWithDetails
    })

  } catch (error) {
    console.error('Highlights fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch highlights' },
      { status: 500 }
    )
  }
}
