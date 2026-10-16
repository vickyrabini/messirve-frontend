import type { Area } from 'react-easy-crop'

// Formato único de las fotos de servicio: los cards y el detalle usan aspect-[4/3],
// así que lo que el usuario recorta es exactamente lo que se ve.
export const PHOTO_ASPECT = 4 / 3
export const PHOTO_OUTPUT = { width: 1200, height: 900 } as const
// Por debajo de este ancho de recorte la foto se estira más de 1.5x y se nota borrosa.
export const PHOTO_MIN_SOURCE_WIDTH = 800

export const PHOTO_HELP_TEXT =
  'Subí una foto horizontal y ajustá el recorte: la vista previa muestra exactamente cómo se verá (formato 4:3, 1200×900px).'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo leer la imagen'))
    img.src = src
  })
}

export async function cropToFile(src: string, area: Area, fileName: string): Promise<File> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = PHOTO_OUTPUT.width
  canvas.height = PHOTO_OUTPUT.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo procesar la imagen')

  // JPEG no tiene transparencia: un PNG con fondo transparente quedaría negro sin esto.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('No se pudo procesar la imagen')

  const baseName = fileName.replace(/\.[^.]+$/, '') || 'foto'
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
}
