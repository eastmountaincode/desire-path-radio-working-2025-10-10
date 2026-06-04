import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export async function createServerSupabase() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in production')
    }

    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey || publishableKey!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    )
}

