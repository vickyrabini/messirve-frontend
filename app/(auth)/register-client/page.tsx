import { createClient } from '@/lib/supabase/server'
import { RegisterClientForm } from './register-client-form'

export default async function RegisterClientPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, emoji')
    .order('order', { ascending: true })

  return <RegisterClientForm categories={categories ?? []} />
}
