type Props = {
  value: number
  size?: number
  onRate?: (stars: number) => void
}

export function StarRating({ value, size = 16, onRate }: Props) {
  const filled = Math.round(value)

  if (!onRate) {
    return (
      <div className="flex items-center gap-0.5" style={{ fontSize: size }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= filled ? 'text-dorado' : 'text-gris'}>
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
          className={`cursor-pointer transition-transform hover:scale-110 ${star <= filled ? 'text-dorado' : 'text-gris'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
