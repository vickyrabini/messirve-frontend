'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { register } from '@/app/actions/auth'

const initialState = { error: null }

function computeStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s as 0 | 1 | 2 | 3 | 4
}

const STRENGTH_COLORS = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'] as const
const STRENGTH_LABELS = ['', 'Débil', 'Mejorable', 'Buena', 'Excelente'] as const

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState)
  const [passwordVal, setPasswordVal] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const showSuccess = !!state?.success

  const submitBtnRef = useRef<HTMLButtonElement>(null)
  const successCardRef = useRef<HTMLDivElement>(null)
  const glow1Ref = useRef<HTMLDivElement>(null)
  const glow2Ref = useRef<HTMLDivElement>(null)
  const prevErrorRef = useRef<string | null>(null)

  const strength = computeStrength(passwordVal)

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

  // Animate success card entrance
  useEffect(() => {
    if (!showSuccess) return
    import('gsap').then(({ gsap }) => {
      gsap.fromTo(
        successCardRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }
      )
    })
  }, [showSuccess])

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
    <>
      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div ref={successCardRef} className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-celeste/15">
              <svg className="h-7 w-7 text-celeste" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-brand uppercase text-2xl text-ink">¡Bienvenido a Messirve!</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Te mandamos un mail para confirmar tu cuenta. Revisá tu bandeja.
            </p>
            <div className="mt-3 text-dorado">★★★</div>
            <Link
              href="/login"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-celeste px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-celeste-dark"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      )}

      {/* Full-screen layout — escapes the (auth) layout's max-w-md centering */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
        <div className="min-h-full lg:grid lg:grid-cols-[1.05fr_1fr]">

          {/* ── PANEL DE MARCA (izq, solo desktop) ── */}
          <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-celeste p-12 xl:p-16 text-white">
            {/* Dot texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '26px 26px' }}
            />
            {/* Glow blobs — GSAP parallax targets */}
            <div ref={glow1Ref} className="float-slow pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div ref={glow2Ref} className="float-slow pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-dorado/25 blur-3xl" />
            {/* Giant star */}
            <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 select-none font-brand text-[13rem] leading-none text-white/[0.06]">
              ★
            </div>
            <div className="pointer-events-none absolute bottom-24 left-1/3 select-none text-3xl text-dorado-light/40">★</div>

            {/* Logo badge */}
            <div className="reveal relative z-10">
              <Link href="/" className="inline-flex items-center rounded-2xl bg-white px-4 py-3 shadow-soft">
                <Image src="/messirve-logo.png" alt="Messirve Barcelona" width={120} height={44} className="h-9 w-auto" />
              </Link>
            </div>

            {/* Centro: copy */}
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

            {/* Estrellas */}
            <div className="reveal relative z-10 flex items-center gap-2" style={{ transitionDelay: '120ms' }}>
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
                  <h1
                    className="reveal font-brand uppercase leading-tight text-ink"
                    style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)' }}
                  >
                    Creá tu cuenta
                  </h1>
                  <p className="reveal mt-2 text-[15px] text-muted" style={{ transitionDelay: '60ms' }}>
                    Sumate a la comunidad. Lleva un minuto.
                  </p>
                </header>

                <form action={formAction} noValidate className="space-y-5">
                  {/* Nombre completo */}
                  <div className="reveal" style={{ transitionDelay: '120ms' }}>
                    <label htmlFor="fullName" className="mb-1.5 block text-[14px] font-semibold text-ink">
                      Nombre completo
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Valentina Gómez"
                      className="w-full rounded-xl border border-gris/60 bg-white/70 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-all focus:border-celeste focus:bg-white focus:outline-none focus:ring-4 focus:ring-celeste/20"
                    />
                  </div>

                  {/* Email */}
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
                      placeholder="vos@email.com"
                      className="w-full rounded-xl border border-gris/60 bg-white/70 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-all focus:border-celeste focus:bg-white focus:outline-none focus:ring-4 focus:ring-celeste/20"
                    />
                  </div>

                  {/* Contraseña */}
                  <div className="reveal" style={{ transitionDelay: '240ms' }}>
                    <label htmlFor="password" className="mb-1.5 block text-[14px] font-semibold text-ink">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordVal}
                        onChange={(e) => setPasswordVal(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
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

                    {/* Password strength meter */}
                    {passwordVal.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((n) => (
                            <div
                              key={n}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                n <= strength ? STRENGTH_COLORS[strength] : 'bg-gris/40'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[12px] text-muted">
                          Seguridad: <span className="font-semibold">{STRENGTH_LABELS[strength]}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <label
                    className="reveal flex cursor-pointer select-none items-start gap-3"
                    style={{ transitionDelay: '300ms' }}
                  >
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 text-[12px] text-white transition-all ${
                        termsAccepted ? 'border-celeste bg-celeste' : 'border-gris/70 bg-white'
                      }`}
                    >
                      {termsAccepted && '✓'}
                    </span>
                    <span className="text-[13px] leading-relaxed text-muted">
                      Acepto los{' '}
                      <Link href="/terms-and-conditions" className="font-semibold text-celeste-deep hover:underline">
                        términos
                      </Link>{' '}
                      y la{' '}
                      <Link href="/terms-and-conditions" className="font-semibold text-celeste-deep hover:underline">
                        política de privacidad
                      </Link>
                      .
                    </span>
                  </label>

                  {/* Error del server action */}
                  {state?.error && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-500">
                      {state.error}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    disabled={isPending || !termsAccepted}
                    className="reveal group relative w-full overflow-hidden rounded-xl bg-celeste-deep px-6 py-3.5 text-[16px] font-semibold text-white shadow-soft transition-all hover:bg-[#15212F] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                    style={{ transitionDelay: '360ms' }}
                  >
                    {isPending ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creando cuenta...
                      </span>
                    ) : (
                      'Crear cuenta'
                    )}
                  </button>
                </form>

                <p className="reveal mt-6 text-center text-[14px] text-muted" style={{ transitionDelay: '420ms' }}>
                  ¿Ya tenés cuenta?{' '}
                  <Link href="/login" className="font-semibold text-celeste-deep hover:underline">
                    Ingresá
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
