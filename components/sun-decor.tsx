type Props = {
  className?: string
}

export function SunDecor({ className = '' }: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none bg-dorado ${className}`}
      style={{
        maskImage: 'url(/sun-decor.svg)',
        WebkitMaskImage: 'url(/sun-decor.svg)',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}
