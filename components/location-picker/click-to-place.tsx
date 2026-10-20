'use client'

import { useMapEvents } from 'react-leaflet'
import type { LocationPoint } from '@/components/location-picker/location-point'
import { roundCoordinate } from '@/lib/round-coordinate'

type Props = {
  onChange: (point: LocationPoint) => void
}

export function ClickToPlace({ onChange }: Props) {
  useMapEvents({
    click: (e) => onChange({ lat: roundCoordinate(e.latlng.lat), lng: roundCoordinate(e.latlng.lng) }),
  })
  return null
}
