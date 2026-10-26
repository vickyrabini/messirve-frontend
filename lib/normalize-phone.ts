import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js'

// Defensa real del teléfono: el input hidden del form se puede manipular, así que el server
// vuelve a validar y guarda siempre E.164 con '+' (ej. +593987078483). Vacío → null.
export function normalizePhone(raw: FormDataEntryValue | null): { phone: string | null } | { error: string } {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return { phone: null }
  if (!isValidPhoneNumber(value)) return { error: 'Teléfono inválido' }
  const parsed = parsePhoneNumberFromString(value)
  return parsed ? { phone: parsed.number } : { error: 'Teléfono inválido' }
}
