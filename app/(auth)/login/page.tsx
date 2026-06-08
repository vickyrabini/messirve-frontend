'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

const initialState = { error: null }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)

  const submitBtnRef = useRef<HTMLButtonElement>(null)
  const glow1Ref = useRef<HTMLDivElement>(null)
  const glow2Ref = useRef<HTMLDivElement>(null)
  const prevErrorRef = useRef<string | null>(null)

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
  }, [])

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

  // Shake submit button on new error
  useEffect(() => {
    if (!state?.error || state.error === prevErrorRef.current) return
    prevErrorRef.current = state.error
    import('gsap').then(({ gsap }) => {
      if (!submitBtnRef.current) return
      gsap.fromTo(submitBtnRef.current, { x: 0 }, { x: 8, duration: 0.5, ease: 'elastic.out(1,0.3)', yoyo: true, repeat: 5 })
    })
  }, [state?.error])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
      <div className="min-h-full lg:grid lg:grid-cols-[1.05fr_1fr]">
        {/* ── PANEL DE MARCA (izq, solo desktop) ── */}
        <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-celeste-deep p-12 xl:p-16 text-white">
          {/* Dot texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '26px 26px' }}
          />
          {/* Glow blobs — GSAP parallax targets */}
          <div ref={glow1Ref} className="float-slow pointer-events-none absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
          <div ref={glow2Ref} className="float-slow pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-celeste/30 blur-3xl" />
          {/* Giant star */}
          <div className="pointer-events-none absolute right-10 top-16 select-none font-brand text-[13rem] leading-none text-white/[0.06]">
            ★
          </div>
          <div className="pointer-events-none absolute bottom-28 left-1/3 select-none text-3xl text-dorado-light/40">★</div>

          {/* Logo badge */}
          <div className="reveal relative z-10">
            <Link href="/" className="inline-flex items-center rounded-2xl bg-white px-4 py-3 shadow-soft">
              <Image src="/messirve-logo.png" alt="Messirve Barcelona" width={120} height={44} className="h-9 w-auto" />
            </Link>
          </div>

          {/* Centro: copy + stats */}
          <div className="relative z-10 max-w-md">
            <p className="reveal text-2xl tracking-widest text-dorado-light">★★★</p>
            <h2
              className="reveal mt-5 font-brand leading-[1.04]"
              style={{ fontSize: 'clamp(2.2rem,3.4vw,3.2rem)', transitionDelay: '60ms' }}
            >
              Qué bueno verte de nuevo.
            </h2>
            <p className="reveal mt-5 text-lg leading-relaxed text-white/80" style={{ transitionDelay: '120ms' }}>
              Iniciá sesión y seguí descubriendo los servicios de confianza que tu comunidad recomienda en Barcelona.
            </p>

            <div className="reveal mt-9 flex items-center gap-6" style={{ transitionDelay: '180ms' }}>
              <div>
                <p className="font-brand text-3xl text-white">7</p>
                <p className="text-[13px] text-white/70">categorías</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div>
                <p className="font-brand text-3xl text-white">★★★★★</p>
                <p className="text-[13px] text-white/70">reseñas de tu gente</p>
              </div>
            </div>
          </div>

          {/* Testimonio */}
          <div className="reveal relative z-10 max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-[15px] leading-relaxed text-white/90">
              &quot;Cada vez que necesito algo, entro a Messirve antes que a Google. Es mi gente recomendando.&quot;
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-dorado/40 text-base">🥐</span>
              <div className="text-[13px]">
                <p className="font-semibold">Mati · Montevideo → El Raval</p>
                <p className="text-dorado-light">★★★★★</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── FORMULARIO (der) ── */}
        <section className="grain relative flex min-h-screen flex-col">
          {/* Top bar */}
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
              <header className="mb-8">
                <h1 className="reveal font-brand leading-tight text-ink" style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)' }}>
                  Iniciar sesión
                </h1>
                <p className="reveal mt-2 text-[15px] text-muted" style={{ transitionDelay: '60ms' }}>
                  Bienvenido de vuelta a tu comunidad.
                </p>
              </header>

              <form action={formAction} noValidate className="space-y-5">
                {/* Email */}
                <div className="reveal" style={{ transitionDelay: '120ms' }}>
                  <label htmlFor="email" className="mb-1.5 block text-[14px] font-semibold text-ink">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="tu@email.com"
                    className="w-full rounded-xl border border-gris/60 bg-white/70 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-all focus:border-celeste focus:bg-white focus:outline-none focus:ring-4 focus:ring-celeste/20"
                  />
                </div>

                {/* Contraseña */}
                <div className="reveal" style={{ transitionDelay: '180ms' }}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="block text-[14px] font-semibold text-ink">
                      Contraseña
                    </label>
                    <Link href="/forgot-password" className="text-[13px] font-semibold text-celeste-deep hover:underline">
                      ¿La olvidaste?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="Tu contraseña"
                      className="w-full rounded-xl border border-gris/60 bg-white/70 px-4 py-3 pr-12 text-[15px] text-ink placeholder:text-muted/60 transition-all focus:border-celeste focus:bg-white focus:outline-none focus:ring-4 focus:ring-celeste/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-celeste/10 hover:text-celeste-deep"
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1={1} y1={1} x2={23} y2={23} />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx={12} cy={12} r={3} />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mantener sesión */}
                <label className="reveal flex cursor-pointer select-none items-center gap-3" style={{ transitionDelay: '240ms' }}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="sr-only" />
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 text-[12px] text-white transition-all ${
                      remember ? 'border-celeste bg-celeste' : 'border-gris/70 bg-white'
                    }`}
                  >
                    {remember && '✓'}
                  </span>
                  <span className="text-[14px] text-muted">Mantener la sesión iniciada</span>
                </label>

                {/* Error del server action */}
                {state?.error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-500">{state.error}</p>
                )}

                {/* Submit */}
                <button
                  ref={submitBtnRef}
                  type="submit"
                  disabled={isPending}
                  className="reveal group relative w-full overflow-hidden rounded-xl bg-celeste px-6 py-3.5 text-[16px] font-semibold text-white shadow-soft transition-all hover:bg-celeste-dark hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                  style={{ transitionDelay: '300ms' }}
                >
                  {isPending ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Entrando...
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      Iniciar sesión{' '}
                      <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                        →
                      </span>
                    </span>
                  )}
                </button>
              </form>

              <p className="reveal mt-6 text-center text-[14px] text-muted" style={{ transitionDelay: '360ms' }}>
                ¿Todavía no tenés cuenta?{' '}
                <Link href="/register" className="font-semibold text-celeste-deep hover:underline">
                  Registrate gratis
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
