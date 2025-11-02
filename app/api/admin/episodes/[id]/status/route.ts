import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const episodeId = parseInt(id)

    if (isNaN(episodeId)) {
      return NextResponse.json(
        { error: 'Invalid episode ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (status !== 'draft' && status !== 'published') {
      return NextResponse.json(
        { error: 'Invalid status. Must be "draft" or "published"' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()

    // Update the episode status
    const { data, error } = await supabase
      .from('episodes')
      .update({ status })
      .eq('id', episodeId)
      .select('id, title, slug, status')
      .single()

    if (error) {
      console.error('Failed to update episode status:', error)
      return NextResponse.json(
        { error: 'Failed to update episode status' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      episode: data
    })

  } catch (error) {
    console.error('Status update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
