import { createClient } from '@supabase/supabase-js'

// Server-only: privileged client using the service-role key. Bypasses RLS entirely.
// Never import this from a Client Component — only from server actions ('use server')
// or Server Components, which Next.js never bundles for the browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials (SUPABASE_SERVICE_ROLE_KEY)')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
