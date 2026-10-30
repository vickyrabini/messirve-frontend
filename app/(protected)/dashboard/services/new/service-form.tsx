'use client'

import { useActionState, useState } from 'react'
import { createService, type ServiceFormState } from '@/app/actions/services'
import { LocationPicker } from '@/components/location-picker/location-picker'
import { PhotoCropInput } from '@/components/photo-crop/photo-crop-input'
import { PHOTO_HELP_TEXT } from '@/lib/crop-image'
import { uppercaseOnInput } from '@/lib/uppercase-input'
import type { Category } from '@/types/database'
import { PhoneInputField } from '@/components/phone-input-field'
import {
  CategorySubcategoryFields,
  type SubcategoryOption,
} from '@/components/service-form/category-subcategory-fields'

const initialState: ServiceFormState = { error: null }

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gris/40 text-sm focus:outline-none focus:ring-2 focus:ring-celeste/30 focus:border-celeste'

const labelClass = 'block text-sm font-medium text-ink mb-1'

type Props = {
  categories: Pick<Category, 'id' | 'name' | 'slug' | 'emoji'>[]
  subcategories: SubcategoryOption[]
}

export function ServiceForm({ categories, subcategories }: Props) {
  const [state, formAction, isPending] = useActionState(createService, initialState)
  const [photoError, setPhotoError] = useState<string | null>(null)

  return (
    <form action={formAction} className="mt-8 space-y-4 rounded-2xl border border-gris/30 bg-white p-6">
      <CategorySubcategoryFields
        categories={categories}
        subcategories={subcategories}
        inputClass={inputClass}
        labelClass={labelClass}
      />

      <div>
        <label htmlFor="name" className={labelClass}>
          Nombre de la marca
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoCapitalize="characters"
          onInput={uppercaseOnInput}
          className={inputClass}
          placeholder="Ej: PELUQUERÍA ANDINA"
        />
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

      <LocationPicker labelClassName={labelClass} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClass}>
            Teléfono
          </label>
          <PhoneInputField id="phone" inputClassName={inputClass} />
        </div>
        <div>
          <label htmlFor="website" className={labelClass}>
            Sitio web
          </label>
          <input id="website" name="website" type="url" className={inputClass} placeholder="https://..." />
        </div>
      </div>

      <div>
        <label htmlFor="instagram" className={labelClass}>
          Instagram
        </label>
        <input id="instagram" name="instagram" type="text" className={inputClass} placeholder="@usuario" />
      </div>

      <div>
        <label htmlFor="photos" className={labelClass}>
          Logo
        </label>
        <PhotoCropInput id="photos" name="photos" className={inputClass} onErrorChange={setPhotoError} />
        {photoError && <p className="mt-1 text-xs font-semibold text-red-500">{photoError}</p>}
        <p className="mt-1 text-xs text-muted">{PHOTO_HELP_TEXT}</p>
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
