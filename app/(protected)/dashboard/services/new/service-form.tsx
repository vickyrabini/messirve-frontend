'use client'

import { useActionState, useState } from 'react'
import { createService, type ServiceFormState } from '@/app/actions/services'
import type { Category } from '@/types/database'

const initialState: ServiceFormState = { error: null }

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gris/40 text-sm focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste'

const labelClass = 'block text-sm font-medium text-ink mb-1'

type Props = {
  categories: Pick<Category, 'id' | 'name' | 'slug' | 'emoji'>[]
}

const MAX_FILE_SIZE = 5 * 1024 * 1024

export function ServiceForm({ categories }: Props) {
  const [state, formAction, isPending] = useActionState(createService, initialState)
  const [photoError, setPhotoError] = useState<string | null>(null)

  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null)
    const files = Array.from(e.target.files ?? [])
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setPhotoError(`"${file.name}" supera el límite de 5MB`)
        return
      }
      if (!file.type.startsWith('image/')) {
        setPhotoError(`"${file.name}" no es una imagen válida`)
        return
      }
    }
  }

  return (
    <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-gris/30 bg-white p-6">
      <div>
        <label htmlFor="categoryId" className={labelClass}>
          Categoría
        </label>
        <select id="categoryId" name="categoryId" required className={inputClass} defaultValue="">
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

      <div>
        <label htmlFor="name" className={labelClass}>
          Nombre del servicio
        </label>
        <input id="name" name="name" type="text" required className={inputClass} placeholder="Ej: Peluquería Andina" />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea id="description" name="description" rows={3} className={inputClass} placeholder="Contanos qué ofrecés" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="address" className={labelClass}>
            Dirección
          </label>
          <input id="address" name="address" type="text" className={inputClass} placeholder="Calle y número" />
        </div>
        <div>
          <label htmlFor="city" className={labelClass}>
            Ciudad
          </label>
          <input id="city" name="city" type="text" defaultValue="Barcelona" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priceInfo" className={labelClass}>
            Precio
          </label>
          <input id="priceInfo" name="priceInfo" type="text" className={inputClass} placeholder="Ej: Desde 15€" />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Teléfono
          </label>
          <input id="phone" name="phone" type="tel" className={inputClass} placeholder="+34 600 000 000" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="website" className={labelClass}>
            Sitio web
          </label>
          <input id="website" name="website" type="url" className={inputClass} placeholder="https://..." />
        </div>
        <div>
          <label htmlFor="instagram" className={labelClass}>
            Instagram
          </label>
          <input id="instagram" name="instagram" type="text" className={inputClass} placeholder="@usuario" />
        </div>
      </div>

      <div>
        <label htmlFor="photos" className={labelClass}>
          Fotos
        </label>
        <input id="photos" name="photos" type="file" multiple accept="image/*" className={inputClass} onChange={handlePhotosChange} />
        {photoError
          ? <p className="mt-1 text-xs font-semibold text-red-500">{photoError}</p>
          : <p className="mt-1 text-xs text-muted">Podés seleccionar varias imágenes (JPG o PNG, hasta 5MB cada una)</p>
        }
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending || !!photoError}
        className="w-full cursor-pointer rounded-lg bg-celeste px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {isPending ? 'Publicando...' : 'Publicar servicio'}
      </button>
    </form>
  )
}
