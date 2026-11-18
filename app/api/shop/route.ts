import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { readShopIntro } from '@/lib/shop-settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const [{ data, error }, intro] = await Promise.all([
      supabase.from('merch_items')
        .select('id, title, description, image_url, gallery_image_urls')
        .is('deleted_at', null).order('id'),
      readShopIntro(supabase),
    ])

    if (error) throw error
    return NextResponse.json({ items: data || [], intro })
  } catch {
    return NextResponse.json({ error: 'Unable to load the shop.' }, { status: 500 })
  }
}
