'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { forgotPassword } from '@/app/actions/auth'

const initialState = { error: null }

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState)
  const [email, setEmail] = useState('')
  const showSent = !!state?.success

  function resend() {
    const fd = new FormData()
    fd.set('email', email)
    formAction(fd)
  }

  const glow1Ref = useRef<HTMLDivElement>(null)
  const glow2Ref = useRef<HTMLDivElement>(null)

  // Reveal stagger — IntersectionObserver + CSS, not RAF-dependent
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const els = document.querySelectorAll('.reveal')
    if (reduce) {
      els.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.1 }
    )
    els.forEach((el) => io.observe(el))
    const fallback = setTimeout(() => els.forEach((el) => el.classList.add('in')), 2500)
    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
  }, [showSent])

  // GSAP mouse parallax on brand panel glows
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !window.matchMedia('(pointer:fine)').matches) return
    let cleanup: (() => void) | undefined
    import('gsap').then(({ gsap }) => {
      const xTo1 = gsap.quickTo(glow1Ref.current, 'x', { duration: 0.8, ease: 'power1.out' })
      const yTo1 = gsap.quickTo(glow1Ref.current, 'y', { duration: 0.8, ease: 'power1.out' })
      const xTo2 = gsap.quickTo(glow2Ref.current, 'x', { duration: 1.2, ease: 'power1.out' })
      const yTo2 = gsap.quickTo(glow2Ref.current, 'y', { duration: 1.2, ease: 'power1.out' })
      const onMouse = (e: MouseEvent) => {
        const dx = (e.clientX / window.innerWidth - 0.5) * 40
        const dy = (e.clientY / window.innerHeight - 0.5) * 40
        xTo1(dx)
        yTo1(dy)
        xTo2(-dx * 0.6)
        yTo2(-dy * 0.6)
      }
      window.addEventListener('mousemove', onMouse, { passive: true })
      cleanup = () => window.removeEventListener('mousemove', onMouse)
    })
    return () => cleanup?.()
  }, [])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
      <div className="min-h-full lg:grid lg:grid-cols-[1.05fr_1fr]">
        {/* ── PANEL DE MARCA (izq, solo desktop) ── */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-celeste p-12 xl:p-16 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '26px 26px' }}
          />
          <div ref={glow1Ref} className="float-slow pointer-events-none absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
          <div ref={glow2Ref} className="float-slow pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-dorado/25 blur-3xl" />
          <div className="pointer-events-none absolute right-10 top-16 select-none font-brand text-[13rem] leading-none text-white/[0.06]">★</div>
          <div className="pointer-events-none absolute bottom-28 left-1/3 select-none text-3xl text-dorado-light/40">★</div>

          <div className="reveal relative z-10">
            <Link href="/" className="inline-flex items-center rounded-2xl bg-white px-4 py-3 shadow-soft">
              <Image src="/messirve-logo.png" alt="Messirve Barcelona" width={120} height={44} className="h-9 w-auto" />
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <h2 className="reveal font-brand uppercase leading-[0.98]" style={{ fontSize: 'clamp(2.4rem,3.6vw,3.6rem)' }}>
              Sentite <br />
              <span style={{ color: '#2C4A73' }}>cerca</span>&nbsp;de casa
            </h2>
            <p className="reveal mt-6 text-lg leading-relaxed text-white/90" style={{ transitionDelay: '60ms' }}>
              La comunidad argentina y uruguaya en Barcelona, a un toque. Reseñas de los que entienden de dónde
              venís.
            </p>
          </div>

          <div className="reveal relative z-10 flex items-center gap-2" style={{ transitionDelay: '180ms' }}>
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
            <Link
              href="/"
              className="ml-auto inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted transition-colors hover:text-celeste-deep"
            >
              <span>←</span> Volver al inicio
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
            <div className="w-full max-w-[440px]">
              {showSent ? (
                <div className="text-center">
                  <div className="reveal mx-auto grid h-[88px] w-[88px] place-items-center rounded-full bg-[#EAF2E8]">
                    <svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke="#2E7D46" strokeWidth={2.2}>
                      <path d="M4 6h16v12H4z" />
                      <path d="M4 7l8 6 8-6" />
                    </svg>
                  </div>
                  <h1 className="reveal mt-7 font-brand uppercase leading-tight text-ink" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)', transitionDelay: '60ms' }}>
                    Revisá tu email
                  </h1>
                  <p className="reveal mt-4 text-[16px] leading-relaxed text-muted" style={{ transitionDelay: '120ms' }}>
                    Si <strong className="text-ink">{email}</strong> está registrado, te llega un enlace para crear
                    una nueva contraseña. Puede tardar un par de minutos.
                  </p>
                  <Link
                    href="/login"
                    className="reveal mt-8 inline-flex w-full items-center justify-center rounded-xl bg-celeste-deep px-6 py-3.5 text-[16px] font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5"
                    style={{ transitionDelay: '180ms' }}
                  >
                    Volver al inicio de sesión
                  </Link>
                  <p className="reveal mt-5 text-[15px] text-muted" style={{ transitionDelay: '240ms' }}>
                    ¿No te llegó?{' '}
                    <button
                      type="button"
                      onClick={resend}
                      disabled={isPending}
                      className="font-semibold text-celeste-deep hover:underline disabled:opacity-60"
                    >
                      {isPending ? 'Reenviando...' : 'Reenviar'}
                    </button>
                  </p>
                </div>
              ) : (
                <div>
                  <Link
                    href="/login"
                    className="reveal mb-6 inline-flex items-center gap-2 text-[15px] font-semibold text-muted transition-colors hover:text-celeste-deep"
                  >
                    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Volver a ingresar
                  </Link>

                  <header className="mb-8">
                    <h1 className="reveal font-brand uppercase leading-tight text-ink" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)', transitionDelay: '60ms' }}>
                      ¿Olvidaste tu contraseña?
                    </h1>
                    <p className="reveal mt-2 text-[15px] text-muted" style={{ transitionDelay: '120ms' }}>
                      Ingresá tu email y te mandamos un enlace para crear una nueva.
                    </p>
                  </header>

                  <form action={formAction} noValidate className="space-y-5">
                    <div className="reveal" style={{ transitionDelay: '180ms' }}>
                      <label htmlFor="email" className="mb-1.5 block text-[14px] font-semibold text-ink">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vos@email.com"
                        className="w-full rounded-xl border border-gris/60 bg-white/70 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-all focus:border-celeste focus:bg-white focus:outline-none focus:ring-4 focus:ring-celeste/20"
                      />
                    </div>

                    {state?.error && (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-500">{state.error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isPending}
                      className="reveal group relative w-full overflow-hidden rounded-xl bg-celeste-deep px-6 py-3.5 text-[16px] font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                      style={{ transitionDelay: '240ms' }}
                    >
                      {isPending ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
