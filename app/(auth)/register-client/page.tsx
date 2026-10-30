import { createClient } from '@/lib/supabase/server'
import { RegisterClientForm } from './register-client-form'

export default async function RegisterClientPage() {
  const supabase = await createClient()
  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    supabase.from('categories').select('id, name, slug, emoji').order('order', { ascending: true }),
    supabase.from('subcategories').select('id, category_id, name').order('order').order('name'),
  ])

  return <RegisterClientForm categories={categories ?? []} subcategories={subcategories ?? []} />
}
