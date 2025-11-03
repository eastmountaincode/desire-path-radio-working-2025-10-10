import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

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

    // Reset all play counts to 0
    const { error } = await supabase
      .from('episodes')
      .update({ play_count: 0 } as never)
      .neq('id', 0) // Update all rows (using neq with a condition that's always true)

    if (error) {
      console.error('Failed to reset play counts:', error)
      return NextResponse.json(
        { error: 'Failed to reset play counts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'All play counts have been reset to 0'
    })

  } catch (error) {
    console.error('Reset play counts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
