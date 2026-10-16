type Props = {
  src: string
  isLowResolution: boolean
  onChange: () => void
  onRemove: () => void
}

export function PhotoCropPreview({ src, isLowResolution, onChange, onRemove }: Props) {
  return (
    <div>
      <div className="aspect-[4/3] w-full max-w-xs overflow-hidden rounded-xl border border-gris/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Vista previa de la foto" className="h-full w-full object-cover" />
      </div>
      {isLowResolution && (
        <p className="mt-1.5 text-xs font-semibold text-dorado-dark">La foto tiene poca resolución, puede verse borrosa.</p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onChange}
          className="cursor-pointer rounded-full border border-gris/40 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-celeste hover:text-celeste-deep"
        >
          Cambiar foto
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink"
        >
          Quitar
        </button>
      </div>
    </div>
  )
}
