import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

// GET - Fetch current schedule image (public endpoint)
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('schedule_image')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch schedule image: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Schedule fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}
