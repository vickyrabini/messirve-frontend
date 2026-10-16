'use client'

import { useEffect, useRef, useState } from 'react'
import type { Area } from 'react-easy-crop'
import { cropToFile, PHOTO_MIN_SOURCE_WIDTH } from '@/lib/crop-image'
import { PhotoCropDialog } from './photo-crop-dialog'
import { PhotoCropPreview } from './photo-crop-preview'

type Props = {
  id: string
  name: string
  className: string
  onErrorChange: (error: string | null) => void
}

type Source = { url: string; fileName: string }

// Reemplaza al <input type="file"> de las fotos de servicio: el usuario recorta en 4:3 y
// el JPEG resultante (1200×900) se inyecta en un input oculto con el mismo `name`, así
// los server actions siguen leyendo formData.getAll(name) sin cambios.
export function PhotoCropInput({ id, name, className, onErrorChange }: Props) {
  const pickerRef = useRef<HTMLInputElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState<Source | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLowResolution, setIsLowResolution] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => () => void (source && URL.revokeObjectURL(source.url)), [source])
  useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl])

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset para que elegir el mismo archivo otra vez vuelva a disparar onChange.
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      onErrorChange(`"${file.name}" no es una imagen válida`)
      return
    }
    onErrorChange(null)
    setSource({ url: URL.createObjectURL(file), fileName: file.name })
  }

  async function handleConfirm(area: Area) {
    if (!source || !fieldRef.current) return
    setIsProcessing(true)
    try {
      const file = await cropToFile(source.url, area, source.fileName)
      const transfer = new DataTransfer()
      transfer.items.add(file)
      fieldRef.current.files = transfer.files
      setPreviewUrl(URL.createObjectURL(file))
      setIsLowResolution(area.width < PHOTO_MIN_SOURCE_WIDTH)
      setSource(null)
    } catch {
      onErrorChange('No se pudo procesar la imagen. Probá con otra.')
      setSource(null)
    } finally {
      setIsProcessing(false)
    }
  }

  function handleRemove() {
    if (fieldRef.current) fieldRef.current.files = new DataTransfer().files
    setPreviewUrl(null)
    setIsLowResolution(false)
  }

  return (
    <>
      <input
        ref={pickerRef}
        id={id}
        type="file"
        accept="image/*"
        className={previewUrl ? 'hidden' : className}
        onChange={handlePick}
      />
      <input ref={fieldRef} name={name} type="file" accept="image/jpeg" hidden />

      {previewUrl && (
        <PhotoCropPreview
          src={previewUrl}
          isLowResolution={isLowResolution}
          onChange={() => pickerRef.current?.click()}
          onRemove={handleRemove}
        />
      )}

      {source && (
        <PhotoCropDialog
          src={source.url}
          isProcessing={isProcessing}
          onCancel={() => setSource(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}
