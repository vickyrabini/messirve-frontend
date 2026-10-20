'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { LocationPoint } from '@/components/location-picker/location-point'

const LocationPickerMap = dynamic(() => import('@/components/location-picker/location-picker-map'), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-lg bg-gris/30" />,
})

type Props = {
  defaultValue?: LocationPoint | null
  labelClassName: string
}

export function LocationPicker({ defaultValue = null, labelClassName }: Props) {
  const [point, setPoint] = useState<LocationPoint | null>(defaultValue)

  return (
    <div>
      <p className={labelClassName}>Ubicación en el mapa</p>
      <div className="relative z-0 h-64 w-full overflow-hidden rounded-lg border border-gris/40">
        <LocationPickerMap value={point} onChange={setPoint} />
      </div>
      <input type="hidden" name="latitude" value={point?.lat ?? ''} />
      <input type="hidden" name="longitude" value={point?.lng ?? ''} />
      <div className="mt-1 flex items-start justify-between gap-3">
        <p className="text-xs text-muted">
          Tocá el mapa para ubicar el pin y arrastralo para ajustarlo. Es opcional.
        </p>
        {point && (
          <button
            type="button"
            onClick={() => setPoint(null)}
            className="shrink-0 cursor-pointer text-xs font-semibold text-celeste-deep hover:underline"
          >
            Quitar ubicación
          </button>
        )}
      </div>
    </div>
  )
}
