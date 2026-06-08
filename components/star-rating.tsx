type Props = {
  value: number
  size?: number
}

export function StarRating({ value, size = 16 }: Props) {
  const filled = Math.round(value)

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
