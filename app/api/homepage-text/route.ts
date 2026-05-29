import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import { DEFAULT_HOMEPAGE_TEXT } from '@/lib/homepage'
import type { HomepageText } from '@/types/database'
import type { PostgrestError } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('homepage_text')
      .select('content')
      .limit(1)
      .maybeSingle() as { data: Pick<HomepageText, 'content'> | null, error: PostgrestError | null }

    if (error) {
      console.error('Failed to fetch homepage text:', error)
      return NextResponse.json({
        text: DEFAULT_HOMEPAGE_TEXT,
        fallback: true,
      })
    }

    return NextResponse.json({
      text: data?.content || DEFAULT_HOMEPAGE_TEXT,
      fallback: !data?.content,
    })

  } catch (error) {
    console.error('Homepage text fetch error:', error)
    return NextResponse.json({
      text: DEFAULT_HOMEPAGE_TEXT,
      fallback: true,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { data: existing, error: fetchError } = await supabase
      .from('homepage_text')
      .select('id')
      .limit(1)
      .maybeSingle() as { data: Pick<HomepageText, 'id'> | null, error: PostgrestError | null }

    if (fetchError) {
      console.error('Failed to check for existing homepage text:', fetchError)
      return NextResponse.json(
        { error: 'Failed to check existing text' },
        { status: 500 }
      )
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('homepage_text')
        // @ts-expect-error - Type inference issue with homepage_text table
        .update({ content: text })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Failed to update homepage text:', updateError)
        return NextResponse.json(
          { error: 'Failed to update text' },
          { status: 500 }
        )
      }
    } else {
      const { error: insertError } = await supabase
        .from('homepage_text')
        // @ts-expect-error - Type inference issue with homepage_text table
        .insert({ content: text })

      if (insertError) {
        console.error('Failed to insert homepage text:', insertError)
        return NextResponse.json(
          { error: 'Failed to insert text' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Homepage text updated successfully'
    })

  } catch (error) {
    console.error('Homepage text update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update text' },
      { status: 500 }
    )
  }
}
