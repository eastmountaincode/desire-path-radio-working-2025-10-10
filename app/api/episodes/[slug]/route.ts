import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createServerSupabase()

    // Check if user is admin
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('admin_authenticated')?.value === 'true'

    // Build the query with joins
    let query = supabase
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

    // Only filter by published status if not admin
    if (!isAdmin) {
      query = query.eq('status', 'published')
    }

    const { data: episodes, error } = await query.limit(1) as { data: EpisodeQueryResult[] | null, error: unknown }

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
      created_at: episodes[0].created_at,
      hosts: episodes[0].episode_hosts?.map((eh) => eh.hosts) || [],
      tags: episodes[0].episode_tags?.map((et) => et.tags) || []
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

