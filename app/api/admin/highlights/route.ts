import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'

const MAX_HIGHLIGHTS = 5

// GET - Fetch all highlighted episodes
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    // Fetch highlights with full episode details
    const { data: highlights, error } = await supabase
      .from('episode_highlights')
      .select(`
        id,
        episode_id,
        display_order,
        created_at,
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

    if (error) {
      console.error('Failed to fetch highlights:', error)
      return NextResponse.json(
        { error: 'Failed to fetch highlights' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      highlights: highlights || [],
      count: highlights?.length || 0,
      max: MAX_HIGHLIGHTS
    })

  } catch (error) {
    console.error('Highlights fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch highlights' },
      { status: 500 }
    )
  }
}

// POST - Add or remove highlight
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

    const body = await request.json()
    const { episode_id } = body

    if (!episode_id || typeof episode_id !== 'number') {
      return NextResponse.json(
        { error: 'Invalid episode_id' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Check if episode exists and is already highlighted
    const { data: existing, error: checkError } = await supabase
      .from('episode_highlights')
      .select('id')
      .eq('episode_id', episode_id)
      .maybeSingle()

    if (checkError) {
      console.error('Failed to check existing highlight:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing highlight' },
        { status: 500 }
      )
    }

    if (existing) {
      // Remove highlight
      const { error: deleteError } = await supabase
        .from('episode_highlights')
        .delete()
        .eq('episode_id', episode_id)

      if (deleteError) {
        console.error('Failed to remove highlight:', deleteError)
        return NextResponse.json(
          { error: 'Failed to remove highlight' },
          { status: 500 }
        )
      }

      // Reorder remaining highlights
      const { data: remaining, error: fetchError } = await supabase
        .from('episode_highlights')
        .select('id')
        .order('display_order', { ascending: true })

      if (!fetchError && remaining) {
        for (let i = 0; i < remaining.length; i++) {
          await supabase
            .from('episode_highlights')
            .update({ display_order: i + 1 })
            .eq('id', remaining[i].id)
        }
      }

      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Highlight removed successfully'
      })

    } else {
      // Check if we're at the limit
      const { count, error: countError } = await supabase
        .from('episode_highlights')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('Failed to count highlights:', countError)
        return NextResponse.json(
          { error: 'Failed to count highlights' },
          { status: 500 }
        )
      }

      if (count && count >= MAX_HIGHLIGHTS) {
        return NextResponse.json(
          { error: `Maximum of ${MAX_HIGHLIGHTS} highlights allowed` },
          { status: 400 }
        )
      }

      // Add highlight at the end
      const nextOrder = (count || 0) + 1

      const { error: insertError } = await supabase
        .from('episode_highlights')
        // @ts-ignore - Type inference issue
        .insert({
          episode_id,
          display_order: nextOrder
        })

      if (insertError) {
        console.error('Failed to add highlight:', insertError)
        return NextResponse.json(
          { error: 'Failed to add highlight' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        action: 'added',
        message: 'Highlight added successfully'
      })
    }

  } catch (error) {
    console.error('Highlight toggle error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle highlight' },
      { status: 500 }
    )
  }
}

// PUT - Reorder highlights
export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { episode_ids } = body

    if (!Array.isArray(episode_ids) || episode_ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid episode_ids array' },
        { status: 400 }
      )
    }

    if (episode_ids.length > MAX_HIGHLIGHTS) {
      return NextResponse.json(
        { error: `Maximum of ${MAX_HIGHLIGHTS} highlights allowed` },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Update display_order for each episode
    for (let i = 0; i < episode_ids.length; i++) {
      const { error: updateError } = await supabase
        .from('episode_highlights')
        // @ts-ignore - Type inference issue
        .update({ display_order: i + 1 })
        .eq('episode_id', episode_ids[i])

      if (updateError) {
        console.error('Failed to update highlight order:', updateError)
        return NextResponse.json(
          { error: 'Failed to update highlight order' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Highlights reordered successfully'
    })

  } catch (error) {
    console.error('Highlight reorder error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reorder highlights' },
      { status: 500 }
    )
  }
}
