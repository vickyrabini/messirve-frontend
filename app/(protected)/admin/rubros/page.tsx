import { createAdminClient } from '@/lib/supabase/admin'
import { CategoryRubrosCard } from './category-rubros-card'
import type { Category, Subcategory } from '@/types/database'
import { AdminPageContainer } from '../admin-page-container'

export default async function AdminRubrosPage() {
  const admin = createAdminClient()

  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    admin.from('categories').select('*').order('order').returns<Category[]>(),
    admin.from('subcategories').select('*').order('order').order('name').returns<Subcategory[]>(),
  ])

  const rubrosByCategory = new Map<string, Subcategory[]>()
  for (const s of subcategories ?? []) {
    rubrosByCategory.set(s.category_id, [...(rubrosByCategory.get(s.category_id) ?? []), s])
  }

  return (
    <AdminPageContainer>
      <h1 className="font-brand uppercase text-2xl text-ink">Rubros de categoría</h1>
      <p className="mt-1 text-sm text-muted">Creá rubros dentro de cada categoría para afinar las búsquedas</p>

      <div className="mt-8 flex flex-col gap-5">
        {(categories ?? []).map((category) => (
          <CategoryRubrosCard key={category.id} category={category} rubros={rubrosByCategory.get(category.id) ?? []} />
        ))}
      </div>
      {(categories ?? []).length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">Todavía no hay categorías cargadas</p>
      )}
    </AdminPageContainer>
  )
}
