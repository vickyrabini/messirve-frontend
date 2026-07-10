export function AuthSunDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -right-24 -bottom-16 h-[460px] w-[460px] bg-cream opacity-[0.14]"
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
