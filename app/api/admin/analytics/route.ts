import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET() {
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

    // Get top 10 most played episodes
    const { data: topEpisodes, error: topError } = await supabase
      .from('episodes')
      .select(`
        id,
        title,
        slug,
        aired_on,
        play_count,
        image_url
      `)
      .order('play_count', { ascending: false })
      .limit(10)

    if (topError) {
      console.error('Failed to fetch top episodes:', topError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    // Get bottom 10 least played episodes (excluding episodes with 0 plays)
    const { data: leastEpisodes, error: leastError } = await supabase
      .from('episodes')
      .select(`
        id,
        title,
        slug,
        aired_on,
        play_count,
        image_url
      `)
      .gt('play_count', 0)
      .order('play_count', { ascending: true })
      .limit(10)

    if (leastError) {
      console.error('Failed to fetch least played episodes:', leastError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    // Get total play count and average
    const { data: stats, error: statsError } = await supabase
      .from('episodes')
      .select('play_count') as { data: Array<{ play_count: number }> | null, error: unknown }

    if (statsError) {
      console.error('Failed to fetch stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    const totalPlays = stats?.reduce((sum, ep) => sum + (ep.play_count || 0), 0) || 0
    const totalEpisodes = stats?.length || 0
    const averagePlays = totalEpisodes > 0 ? Math.round(totalPlays / totalEpisodes) : 0

    return NextResponse.json({
      topEpisodes: topEpisodes || [],
      leastPlayed: leastEpisodes || [],
      stats: {
        totalPlays,
        totalEpisodes,
        averagePlays
      }
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
