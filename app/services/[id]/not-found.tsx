import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AuthNavActions } from '@/components/auth-nav-actions'
import { SunDecor } from '@/components/sun-decor'

export default async function ServiceNotFound() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-gris/40 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/">
            <Image src="/messirve-logo.png" alt="Messirve Barcelona" width={120} height={44} className="h-10 w-auto" />
          </Link>
          <AuthNavActions isAuthenticated={!!user} />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-1 items-center justify-center px-5 py-16 sm:px-8">
        <div className="relative w-full max-w-lg">
          <SunDecor className="pointer-events-none absolute -bottom-20 right-0 h-[360px] w-[360px] opacity-10" />
          <div className="relative rounded-[20px] border border-gris/40 bg-white px-8 py-14 text-center sm:px-10">
            <SunDecor className="mx-auto mb-5 h-16 w-16" />
            <p className="font-brand text-4xl uppercase text-ink">404</p>
            <p className="mx-auto mt-3 max-w-[380px] text-[17px] leading-relaxed text-muted">
              Este servicio no existe o ya no está disponible.
            </p>
            <Link
              href="/search"
              className="mt-7 inline-flex items-center rounded-full bg-dorado px-8 py-4 font-brand text-[15px] uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 hover:bg-dorado-light"
            >
              Volver a la búsqueda
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
