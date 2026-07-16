'use client'

import { useRouter } from 'next/navigation'
import { Banner } from '@/components/banner'

export function CheckoutSuccessBanner({ status }: { status: 'success' | 'cancel' | null }) {
  const router = useRouter()

  if (status !== 'success') return null

  return (
    <Banner variant="gold" onDismiss={() => router.replace('/dashboard', { scroll: false })}>
      Pago exitoso. Estamos confirmando tu suscripción, esto puede tardar unos segundos — actualizá la página en un
      momento.
    </Banner>
  )
}
