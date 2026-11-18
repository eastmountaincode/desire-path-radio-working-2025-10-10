import type { createServerSupabase } from '@/lib/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

export async function readShopIntro(supabase: Awaited<ReturnType<typeof createServerSupabase>>) {
  const { data, error } = await supabase.from('shop_settings').select('intro').eq('id', 1)
    .maybeSingle() as { data: { intro: string } | null; error: PostgrestError | null }
  if (error) throw error
  return data?.intro ?? ''
}
