import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ResetPasswordForm from './reset-password-form'
import { AuthSunDecor } from '@/components/auth-sun-decor'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/forgot-password')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
      <div className="min-h-full lg:grid lg:grid-cols-[1.05fr_1fr]">
        {/* ── PANEL DE MARCA (izq, solo desktop) ── */}
        <aside className="relative hidden lg:flex flex-col overflow-hidden bg-celeste p-12 xl:p-16 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '26px 26px' }}
          />
          <div className="float-slow pointer-events-none absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
          <div className="float-slow pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-dorado/25 blur-3xl" />
          <AuthSunDecor />

          {/* Logo badge
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center rounded-2xl bg-white px-4 py-3 shadow-soft">
              <Image src="/messirve-logo.png" alt="Messirve Barcelona" width={120} height={44} className="h-9 w-auto" />
            </Link>
          </div> */}

          <div className="relative z-10 flex flex-1 flex-col justify-center max-w-md">
            <h2 className="font-brand uppercase leading-[0.98]" style={{ fontSize: 'clamp(2.4rem,3.6vw,3.6rem)' }}>
              Sentite <br />
              <span style={{ color: '#2C4A73' }}>cerca</span>&nbsp;de casa
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-white/90">
              La comunidad argentina y uruguaya en Barcelona, a un toque. Reseñas de los que entienden de dónde
              venís.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <svg width={26} height={26} viewBox="0 0 24 24" fill="#CFB176">
              <polygon points="12,2 15,9 22,9.3 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.3 9,9" />
            </svg>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="#CFB176">
              <polygon points="12,2 15,9 22,9.3 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.3 9,9" />
            </svg>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="#CFB176">
              <polygon points="12,2 15,9 22,9.3 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.3 9,9" />
            </svg>
          </div>
        </aside>

        {/* ── FORMULARIO (der) ── */}
        <section className="grain relative flex min-h-screen flex-col">
          <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
            <Link href="/" className="lg:hidden">
              <Image src="/messirve-logo.png" alt="Messirve Barcelona" width={120} height={44} className="h-10 w-auto" />
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
            <div className="w-full max-w-[440px]">
              <header className="mb-8">
                <h1 className="font-brand uppercase leading-tight text-ink" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)' }}>
                  Nueva contraseña
                </h1>
                <p className="mt-2 text-[15px] text-muted">Elegí una contraseña nueva y segura para tu cuenta.</p>
              </header>

              <ResetPasswordForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
