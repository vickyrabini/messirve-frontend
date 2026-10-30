'use client'

import { deleteSubcategory } from '@/app/actions/subcategories'
import type { Subcategory } from '@/types/database'

export function RubroChip({ rubro }: { rubro: Subcategory }) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!confirm(`¿Eliminar el rubro "${rubro.name}"? No se puede deshacer.`)) {
      event.preventDefault()
    }
  }

  return (
    <form
      action={deleteSubcategory}
      onSubmit={handleSubmit}
      className="flex items-center gap-1.5 rounded-full border border-gris/40 bg-cream/60 py-1 pl-3.5 pr-1.5 text-sm font-medium text-ink"
    >
      <input type="hidden" name="subcategoryId" value={rubro.id} />
      {rubro.name}
      <button
        type="submit"
        aria-label={`Eliminar rubro ${rubro.name}`}
        className="cursor-pointer rounded-full p-1 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </form>
  )
}
