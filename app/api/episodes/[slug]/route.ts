import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createServerSupabase()

    // Build the query with joins
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
      .eq('slug', slug)
      .limit(1)

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
      created_at: episodes[0].created_at,
      hosts: episodes[0].episode_hosts?.map((eh: { hosts: { id: number; name: string; organization: string | null } }) => eh.hosts) || [],
      tags: episodes[0].episode_tags?.map((et: { tags: { id: number; name: string; slug: string; type: string } }) => et.tags) || []
    }

    return NextResponse.json({ episode })

  } catch (error) {
    console.error('Episode API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

