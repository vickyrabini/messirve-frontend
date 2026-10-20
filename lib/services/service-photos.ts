export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// La extensión sale de un mapeo fijo por MIME type, nunca del nombre de archivo que
// manda el cliente (falseable) — cierra la vía de subir bytes arbitrarios con una
// extensión engañosa al bucket público service-photos.
export const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
