// src/lib/supabase/server.ts
// Server-side Supabase client -used in Server Components, API routes, and middleware
// Reads/writes cookies to manage the user's session

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function  createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Read cookies from the incoming request
                getAll() {
                    return cookieStore.getAll()
                },
                // Write cookies back to the browser (session refresh)
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                    } catch {
                        // Expected to fail in Server Component - middleware handles this
                    }
                },
            },
        }
    )
}           
// Service role client - bypasses RLS for server-side operations
// Only use in API routes that have already verified the JWT
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
