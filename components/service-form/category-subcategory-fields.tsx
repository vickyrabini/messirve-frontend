'use client'

import { useState } from 'react'
import type { Category, Subcategory } from '@/types/database'

export type SubcategoryOption = Pick<Subcategory, 'id' | 'category_id' | 'name'>

type Props = {
  categories: Pick<Category, 'id' | 'name' | 'emoji'>[]
  subcategories: SubcategoryOption[]
  defaultCategoryId?: string
  defaultSubcategoryId?: string | null
  inputClass: string
  labelClass: string
}

// Select de categoría + rubro dependiente, compartido por los 4 formularios de servicio.
// El rubro es obligatorio solo si la categoría elegida tiene rubros (misma regla que
// parseSubcategory en el server). Cambiar la categoría resetea el rubro.
export function CategorySubcategoryFields({
  categories,
  subcategories,
  defaultCategoryId = '',
  defaultSubcategoryId,
  inputClass,
  labelClass,
}: Props) {
  const [categoryId, setCategoryId] = useState(defaultCategoryId)
  const [subcategoryId, setSubcategoryId] = useState(defaultSubcategoryId ?? '')

  const rubros = subcategories.filter((s) => s.category_id === categoryId)

  function handleCategoryChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setCategoryId(event.target.value)
    setSubcategoryId('')
  }

  return (
    <>
      <div>
        <label htmlFor="categoryId" className={labelClass}>
          Categoría
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className={inputClass}
          value={categoryId}
          onChange={handleCategoryChange}
        >
          <option value="" disabled>
            Elegí una categoría
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji ? `${c.emoji} ` : ''}
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {rubros.length > 0 && (
        <div>
          <label htmlFor="subcategoryId" className={labelClass}>
            Rubro
          </label>
          <select
            id="subcategoryId"
            name="subcategoryId"
            required
            className={inputClass}
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
          >
            <option value="" disabled>
              Elegí un rubro
            </option>
            {rubros.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  )
}
