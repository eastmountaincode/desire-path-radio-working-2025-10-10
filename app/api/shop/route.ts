import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('merch_items')
      .select('id, title, description, image_url')
      .is('deleted_at', null)
      .order('id')

    if (error) throw error
    return NextResponse.json({ items: data || [] })
  } catch {
    return NextResponse.json({ error: 'Unable to load the shop.' }, { status: 500 })
  }
}
