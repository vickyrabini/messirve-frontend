'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { updateService, type UpdateServiceState } from '@/app/actions/services'
import type { Category } from '@/types/database'

const initialState: UpdateServiceState = { error: null }

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gris/40 text-sm focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste'

const labelClass = 'block text-sm font-medium text-ink mb-1'

const MAX_FILE_SIZE = 5 * 1024 * 1024

type Service = {
  id: string
  category_id: string
  name: string
  description: string | null
  address: string | null
  city: string | null
  price_info: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  photos: string[]
}

type Props = {
  service: Service
  categories: Pick<Category, 'id' | 'name' | 'slug' | 'emoji'>[]
}

export function EditServiceForm({ service, categories }: Props) {
  const [state, formAction, isPending] = useActionState(updateService, initialState)
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
      <input type="hidden" name="serviceId" value={service.id} />

      <div>
        <label htmlFor="categoryId" className={labelClass}>
          Categoría
        </label>
        <select id="categoryId" name="categoryId" required className={inputClass} defaultValue={service.category_id}>
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
        <input id="name" name="name" type="text" required className={inputClass} defaultValue={service.name} />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea id="description" name="description" rows={3} className={inputClass} defaultValue={service.description ?? ''} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="address" className={labelClass}>
            Dirección
          </label>
          <input id="address" name="address" type="text" className={inputClass} defaultValue={service.address ?? ''} />
        </div>
        <div>
          <label htmlFor="city" className={labelClass}>
            Ciudad
          </label>
          <input id="city" name="city" type="text" className={inputClass} defaultValue={service.city ?? 'Barcelona'} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priceInfo" className={labelClass}>
            Precio
          </label>
          <input id="priceInfo" name="priceInfo" type="text" className={inputClass} defaultValue={service.price_info ?? ''} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Teléfono
          </label>
          <input id="phone" name="phone" type="tel" className={inputClass} defaultValue={service.phone ?? ''} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="website" className={labelClass}>
            Sitio web
          </label>
          <input id="website" name="website" type="url" className={inputClass} defaultValue={service.website ?? ''} />
        </div>
        <div>
          <label htmlFor="instagram" className={labelClass}>
            Instagram
          </label>
          <input id="instagram" name="instagram" type="text" className={inputClass} defaultValue={service.instagram ?? ''} />
        </div>
      </div>

      <div>
        <label htmlFor="photos" className={labelClass}>
          Fotos
        </label>
        {service.photos.length > 0 && (
          <div className="mb-2 space-y-1.5">
            <p className="text-xs font-medium text-ink">Fotos actuales</p>
            <div className="flex flex-wrap gap-2">
              {service.photos.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt={`Foto ${i + 1}`} className="h-16 w-16 rounded-lg border border-gris/30 object-cover" />
              ))}
            </div>
            <p className="text-xs text-muted">Si seleccionás fotos nuevas, estas serán reemplazadas y eliminadas</p>
          </div>
        )}
        <input id="photos" name="photos" type="file" multiple accept="image/*" className={inputClass} onChange={handlePhotosChange} />
        {photoError ? (
          <p className="mt-1 text-xs font-semibold text-red-500">{photoError}</p>
        ) : (
          <p className="mt-1 text-xs text-muted">Dejalo vacío para mantener las fotos actuales</p>
        )}
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending || !!photoError}
          className="flex-1 cursor-pointer rounded-lg bg-celeste px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
        >
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-gris/40 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
