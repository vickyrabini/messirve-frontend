import { createClient } from '@/lib/supabase/server'
import LandingPage from './components/landing-page'

export default async function HomePage() {
  const supabase = await createClient()
  const [
    {
      data: { user },
    },
    { data: categories },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('categories').select('id, name, slug, emoji, created_at').order('order', { ascending: true }),
  ])

  return <LandingPage isAuthenticated={!!user} categories={categories ?? []} />
}
