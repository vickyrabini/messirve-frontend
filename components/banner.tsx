'use client'

import { useState } from 'react'

type BannerVariant = 'success' | 'error' | 'info' | 'gold'
type Props = { variant: BannerVariant; children: React.ReactNode; onDismiss?: () => void }

const VARIANT_STYLES: Record<BannerVariant, string> = {
  success: 'bg-[#E7F1E9] text-[#2E7D46]',
  error: 'bg-red-50 text-red-500',
  info: 'bg-celeste/10 text-celeste-deep',
  gold: 'bg-dorado/10 text-dorado-dark',
}

export function Banner({ variant, children, onDismiss }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className={`mb-6 flex items-start justify-between gap-3 rounded-lg px-4 py-3 text-sm font-semibold ${VARIANT_STYLES[variant]}`}>
      <p>{children}</p>
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => {
          setDismissed(true)
          onDismiss?.()
        }}
        className="shrink-0 text-lg leading-none opacity-60 transition-opacity hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}
