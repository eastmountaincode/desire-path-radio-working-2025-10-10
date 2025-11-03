import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // Verify request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    )

    // Ping the database
    const { error } = await supabase
      .from('episodes')
      .select('id')
      .limit(1)

    if (error) {
      // Log the failure
      await supabase.from('admin_logs').insert({
        event_type: 'database_keep_alive',
        status: 'error',
        message: `Database ping failed: ${error.message}`
      })

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log the success
    await supabase.from('admin_logs').insert({
      event_type: 'database_keep_alive',
      status: 'success',
      message: 'Database pinged successfully'
    })

    return NextResponse.json({
      success: true,
      message: 'Database pinged and logged'
    })

  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
