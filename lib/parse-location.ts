import { roundCoordinate } from '@/lib/round-coordinate'

export type ParsedLocation = { latitude: number | null; longitude: number | null }

function parseCoordinate(raw: FormDataEntryValue | null, limit: number): number | null | undefined {
  if (typeof raw !== 'string' || raw.trim() === '') return null
  const value = Number(raw)
  if (!Number.isFinite(value) || Math.abs(value) > limit) return undefined
  return roundCoordinate(value)
}

// null = ubicación inválida (fuera de rango o solo una de las dos coordenadas).
// Sin pin devuelve { latitude: null, longitude: null }.
export function parseLocation(formData: FormData): ParsedLocation | null {
  const latitude = parseCoordinate(formData.get('latitude'), 90)
  const longitude = parseCoordinate(formData.get('longitude'), 180)

  if (latitude === undefined || longitude === undefined) return null
  if ((latitude === null) !== (longitude === null)) return null

  return { latitude, longitude }
}
