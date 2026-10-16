'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { PHOTO_ASPECT } from '@/lib/crop-image'

type Props = {
  src: string
  isProcessing: boolean
  onCancel: () => void
  onConfirm: (area: Area) => void
}

export function PhotoCropDialog({ src, isProcessing, onCancel, onConfirm }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)

  // Portal a body: los forms de registro animan con transform (.reveal), y un
  // position: fixed dentro de un ancestro transformado no cubre la pantalla.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="px-6 pt-5">
          <p className="text-[17px] font-bold text-ink">Ajustá tu foto</p>
          <p className="mt-1 text-[13px] text-muted">Arrastrá y hacé zoom. Así se va a ver en las tarjetas y en el detalle del servicio.</p>
        </div>

        <div className="relative mt-4 aspect-[4/3] w-full bg-ink">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={PHOTO_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
          />
        </div>

        <div className="px-6 py-5">
          <label htmlFor="photo-zoom" className="text-[13px] font-semibold text-ink">
            Zoom
          </label>
          <input
            id="photo-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-1 w-full accent-celeste"
          />

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="cursor-pointer rounded-full px-5 py-2.5 text-[14px] font-semibold text-muted transition-colors hover:text-ink disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => area && onConfirm(area)}
              disabled={!area || isProcessing}
              className="cursor-pointer rounded-full bg-celeste px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-celeste-dark disabled:opacity-60"
            >
              {isProcessing ? 'Procesando...' : 'Aplicar recorte'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
