import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createServerSupabase()

    // First, get the episode ID by slug
    const { data: episode, error: fetchError } = await supabase
      .from('episodes')
      .select('id, play_count')
      .eq('slug', slug)
      .single()

    if (fetchError || !episode) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      )
    }

    // Increment the play count using a database-level operation to avoid race conditions
    const { error: updateError } = await supabase
      .from('episodes')
      .update({ play_count: (episode.play_count || 0) + 1 })
      .eq('id', episode.id)

    if (updateError) {
      console.error('Failed to update play count:', updateError)
      return NextResponse.json(
        { error: 'Failed to update play count' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      play_count: (episode.play_count || 0) + 1
    })

  } catch (error) {
    console.error('Play count API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
