'use client'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { ClickToPlace } from '@/components/location-picker/click-to-place'
import type { LocationPoint } from '@/components/location-picker/location-point'
import { roundCoordinate } from '@/lib/round-coordinate'

// El ícono por defecto de Leaflet resuelve sus URLs en runtime y se rompe con bundlers;
// importar los PNG de node_modules con Turbopack deja `.src` vacío, así que se sirven desde public/.
const pinIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

const BARCELONA: [number, number] = [41.3874, 2.1686]

type Props = {
  value: LocationPoint | null
  onChange: (point: LocationPoint | null) => void
}

export default function LocationPickerMap({ value, onChange }: Props) {
  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : BARCELONA}
      zoom={value ? 16 : 13}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onChange={onChange} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng()
              onChange({ lat: roundCoordinate(lat), lng: roundCoordinate(lng) })
            },
          }}
        />
      )}
    </MapContainer>
  )
}
