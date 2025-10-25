import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import type { ComingUpText } from '@/types/database'
import type { PostgrestError } from '@supabase/supabase-js'

// GET - Fetch coming up text
export async function GET() {
  try {
    const supabase = await createServerSupabase()

    // Fetch the coming_up_text from the database
    const { data, error } = await supabase
      .from('coming_up_text')
      .select('content')
      .limit(1)
      .maybeSingle() as { data: Pick<ComingUpText, 'content'> | null, error: PostgrestError | null }

    if (error) {
      console.error('Failed to fetch coming up text:', error)
      return NextResponse.json(
        { error: 'Failed to fetch text' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      text: data?.content || ''
    })

  } catch (error) {
    console.error('Coming up text fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch text' },
      { status: 500 }
    )
  }
}

// POST - Update coming up text
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
    const { text } = body

    if (typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid text format' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // First, check if a record exists
    const { data: existing, error: fetchError } = await supabase
      .from('coming_up_text')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: Pick<ComingUpText, 'id'> | null, error: PostgrestError | null }

    if (fetchError) {
      console.error('Failed to check for existing text:', fetchError)
      return NextResponse.json(
        { error: 'Failed to check existing text' },
        { status: 500 }
      )
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('coming_up_text')
        // @ts-expect-error - Type inference issue with coming_up_text table
        .update({ content: text })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Failed to update coming up text:', updateError)
        return NextResponse.json(
          { error: 'Failed to update text' },
          { status: 500 }
        )
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('coming_up_text')
        // @ts-expect-error - Type inference issue with coming_up_text table
        .insert({ content: text })

      if (insertError) {
        console.error('Failed to insert coming up text:', insertError)
        return NextResponse.json(
          { error: 'Failed to insert text' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Coming up text updated successfully'
    })

  } catch (error) {
    console.error('Coming up text update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update text' },
      { status: 500 }
    )
  }
}
