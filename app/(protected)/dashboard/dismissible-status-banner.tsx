'use client'

import { useRouter } from 'next/navigation'
import { Banner } from '@/components/banner'

type Props = {
  show: boolean
  variant: 'success' | 'error' | 'info' | 'gold'
  children: React.ReactNode
}

export function DismissibleStatusBanner({ show, variant, children }: Props) {
  const router = useRouter()
  if (!show) return null

  return (
    <Banner variant={variant} onDismiss={() => router.replace('/dashboard', { scroll: false })}>
      {children}
    </Banner>
  )
}
