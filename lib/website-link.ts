// Sin esquema, openURL falla en la app y el href queda relativo en la web: se antepone https://.
// El label muestra solo dominio + path (sin protocolo, www. ni "/" final) para que se lea limpio.
// Regex en vez de new URL() para mantener la misma implementación que messirve-app (RN no implementa hostname).
const WEBSITE_PATTERN = /^(?:https?:\/\/)?([^/?#]+)([^?#]*)/i

export function buildWebsiteLink(website: string | null): { href: string; label: string } | null {
  if (!website) return null

  const trimmed = website.trim()
  const match = trimmed.match(WEBSITE_PATTERN)
  if (!match || /\s/.test(trimmed) || !match[1].includes('.')) return null

  const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  const host = match[1].toLowerCase().replace(/^www\./, '')
  const path = match[2].replace(/\/+$/, '')

  return { href, label: `${host}${path}` }
}
