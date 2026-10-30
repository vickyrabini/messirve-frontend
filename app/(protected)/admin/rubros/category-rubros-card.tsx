import { CreateSubcategoryForm } from './create-subcategory-form'
import { RubroChip } from './rubro-chip'
import type { Category, Subcategory } from '@/types/database'

export function CategoryRubrosCard({ category, rubros }: { category: Category; rubros: Subcategory[] }) {
  return (
    <section className="rounded-2xl border border-gris/30 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-brand uppercase text-lg text-ink">
          {category.emoji} {category.name}
        </h2>
        <span className="shrink-0 rounded-full bg-celeste/10 px-2.5 py-1 text-xs font-semibold text-celeste-deep">
          {rubros.length} {rubros.length === 1 ? 'rubro' : 'rubros'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {rubros.map((rubro) => (
          <RubroChip key={rubro.id} rubro={rubro} />
        ))}
        {rubros.length === 0 && <p className="text-sm text-muted">Esta categoría todavía no tiene rubros</p>}
      </div>

      <CreateSubcategoryForm categoryId={category.id} />
    </section>
  )
}
