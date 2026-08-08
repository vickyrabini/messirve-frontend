'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { registerClient, type RegisterClientState } from '@/app/actions/register-client'
import { AuthSunDecor } from '@/components/auth-sun-decor'
import type { Category } from '@/types/database'

const initialState: RegisterClientState = { error: null }

const inputClass =
  'w-full rounded-xl border border-gris/60 bg-white/70 px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 transition-all focus:border-celeste focus:bg-white focus:outline-none focus:ring-4 focus:ring-celeste/20'

const labelClass = 'mb-1.5 block text-[14px] font-semibold text-ink'

const MAX_FILE_SIZE = 5 * 1024 * 1024

type Props = {
  categories: Pick<Category, 'id' | 'name' | 'slug' | 'emoji'>[]
}

export function RegisterClientForm({ categories }: Props) {
  const [state, formAction, isPending] = useActionState(registerClient, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const showSuccess = !!state?.success

  const submitBtnRef = useRef<HTMLButtonElement>(null)
  const successCardRef = useRef<HTMLDivElement>(null)
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

  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhotoError(null)
    const files = Array.from(e.target.files ?? [])
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setPhotoError(`"${file.name}" supera el límite de 5MB`)
        return
      }
      if (!file.type.startsWith('image/')) {
        setPhotoError(`"${file.name}" no es una imagen válida`)
        return
      }
    }
  }

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
              Te mandamos un mail para confirmar tu cuenta. Tu servicio quedó cargado y{' '}
              <span className="font-semibold text-ink">pendiente de aprobación</span> — te avisamos apenas nuestro
              equipo lo revise para que puedas pagar la suscripción y quede visible.
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

      {/* Full-screen layout — escapes the (auth) layout's max-w-md centering.
          El contenedor no scrollea: cada columna maneja su propio overflow para que
          el panel de marca quede fijo mientras el formulario (más largo) scrollea solo. */}
      <div className="fixed inset-0 z-50 bg-cream">
        <div className="h-full lg:grid lg:grid-cols-[1.05fr_1fr]">

          {/* ── PANEL DE MARCA (izq, solo desktop, altura fija, no scrollea) ── */}
          <aside className="relative hidden h-full lg:flex flex-col overflow-hidden bg-celeste p-12 xl:p-16 text-white">
            {/* Dot texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '26px 26px' }}
            />
            {/* Glow blobs — GSAP parallax targets */}
            <div ref={glow1Ref} className="float-slow pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div ref={glow2Ref} className="float-slow pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-dorado/25 blur-3xl" />
            <AuthSunDecor />

            {/* Centro: copy */}
            <div className="relative z-10 flex flex-1 flex-col justify-center max-w-md">
              <h2 className="reveal font-brand uppercase leading-[0.98]" style={{ fontSize: 'clamp(2.4rem,3.6vw,3.6rem)' }}>
                Sumá tu <br />
                <span style={{ color: '#2C4A73' }}>negocio</span>&nbsp;a Messirve
              </h2>
              <p className="reveal mt-6 text-lg leading-relaxed text-white/90" style={{ transitionDelay: '60ms' }}>
                Cargá tu cuenta y tu servicio en un solo paso. Lo revisamos, lo aprobamos y recién ahí pagás — así
                llegás a toda la comunidad argentina y uruguaya en Barcelona.
              </p>

              {/* Pasos del flujo */}
              <ul className="reveal mt-8 space-y-4" style={{ transitionDelay: '100ms' }}>
                {[
                  ['1', 'Completá tus datos y los de tu servicio'],
                  ['2', 'Nuestro equipo lo revisa y lo aprueba'],
                  ['3', 'Pagás la suscripción y ya queda visible'],
                ].map(([n, text]) => (
                  <li key={n} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-[13px] font-bold">
                      {n}
                    </span>
                    <span className="mt-0.5 text-[15px] text-white/90">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Estrellas */}
            <div className="reveal relative z-10 flex items-center gap-2" style={{ transitionDelay: '160ms' }}>
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
          <section className="grain relative flex h-full flex-col overflow-y-auto">
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
              <div className="w-full max-w-[520px]">
                <header className="mb-8">
                  <h1
                    className="reveal font-brand uppercase leading-tight text-ink"
                    style={{ fontSize: 'clamp(1.9rem,4vw,2.6rem)' }}
                  >
                    Sumate como emprendedor
                  </h1>
                  <p className="reveal mt-2 text-[15px] text-muted" style={{ transitionDelay: '60ms' }}>
                    Creá tu cuenta y cargá tu servicio ahora. Lo aprobamos y recién ahí te pedimos el pago.
                  </p>
                </header>

                <form action={formAction} noValidate className="space-y-6">
                  {/* Sección: cuenta */}
                  <div className="reveal space-y-5" style={{ transitionDelay: '100ms' }}>
                    <p className="text-[13px] font-bold uppercase tracking-wide text-celeste-deep">Tu cuenta</p>

                    <div>
                      <label htmlFor="fullName" className={labelClass}>
                        Nombre completo
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Valentina Gómez"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="vos@email.com"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className={labelClass}>
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          minLength={6}
                          placeholder="Mínimo 6 caracteres"
                          className={`${inputClass} pr-12`}
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
                  </div>

                  {/* Sección: servicio */}
                  <div className="reveal space-y-5 border-t border-gris/30 pt-6" style={{ transitionDelay: '160ms' }}>
                    <div>
                      <p className="text-[13px] font-bold uppercase tracking-wide text-celeste-deep">Tu servicio</p>
                      <p className="mt-1 text-[13px] text-muted">
                        Quedará pendiente de aprobación — no se publica todavía.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="categoryId" className={labelClass}>
                        Categoría
                      </label>
                      <select id="categoryId" name="categoryId" required className={inputClass} defaultValue="">
                        <option value="" disabled>
                          Elegí una categoría
                        </option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.emoji ? `${c.emoji} ` : ''}
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="name" className={labelClass}>
                        Nombre del servicio
                      </label>
                      <input id="name" name="name" type="text" required className={inputClass} placeholder="Ej: Peluquería Andina" />
                    </div>

                    <div>
                      <label htmlFor="description" className={labelClass}>
                        Descripción
                      </label>
                      <textarea id="description" name="description" rows={3} className={inputClass} placeholder="Contanos qué ofrecés" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="address" className={labelClass}>
                          Dirección
                        </label>
                        <input id="address" name="address" type="text" className={inputClass} placeholder="Calle y número" />
                      </div>
                      <div>
                        <label htmlFor="city" className={labelClass}>
                          Ciudad
                        </label>
                        <input id="city" name="city" type="text" defaultValue="Barcelona" className={inputClass} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="phone" className={labelClass}>
                          Teléfono
                        </label>
                        <input id="phone" name="phone" type="tel" className={inputClass} placeholder="+34 600 000 000" />
                      </div>
                      <div>
                        <label htmlFor="website" className={labelClass}>
                          Sitio web
                        </label>
                        <input id="website" name="website" type="url" className={inputClass} placeholder="https://..." />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="instagram" className={labelClass}>
                        Instagram
                      </label>
                      <input id="instagram" name="instagram" type="text" className={inputClass} placeholder="@usuario" />
                    </div>

                    <div>
                      <label htmlFor="photos" className={labelClass}>
                        Logo
                      </label>
                      <input
                        id="photos"
                        name="photos"
                        type="file"
                        accept="image/*"
                        className={inputClass}
                        onChange={handlePhotosChange}
                      />
                      {photoError && <p className="mt-1 text-xs font-semibold text-red-500">{photoError}</p>}
                      <p className="mt-1 text-xs text-muted">
                        Para que se vea completa y sin recortes, subí una foto horizontal (formato 4:3, por ejemplo 1200×900px).
                      </p>
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="reveal flex cursor-pointer select-none items-start gap-3" style={{ transitionDelay: '220ms' }}>
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

                  <p className="reveal text-center text-[13px] leading-relaxed text-muted" style={{ transitionDelay: '240ms' }}>
                    Registrarte es gratis. Cuando tu servicio sea aprobado, vas a poder activarlo con una suscripción mensual de{' '}
                    <span className="font-bold text-ink">18€</span> para que aparezca en las búsquedas.
                  </p>

                  {/* Error del server action */}
                  {state?.error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-[#E8B4AC] bg-[#FBEAE7] px-5 py-4">
                      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#C0492F" strokeWidth={2.2} className="mt-0.5 shrink-0">
                        <circle cx={12} cy={12} r={9} />
                        <path d="M12 8v4" />
                        <circle cx={12} cy={16} r={0.6} fill="#C0492F" stroke="none" />
                      </svg>
                      <div>
                        <p className="text-[16px] font-semibold text-[#A63B24]">No pudimos completar el registro</p>
                        <p className="mt-0.5 text-[15px] text-[#B4665A]">{state.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    disabled={isPending || !termsAccepted || !!photoError}
                    className="reveal group relative w-full overflow-hidden rounded-xl bg-celeste-deep px-6 py-3.5 text-[16px] font-semibold text-white shadow-soft transition-all hover:bg-[#15212F] hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
                    style={{ transitionDelay: '260ms' }}
                  >
                    {isPending ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creando cuenta y servicio...
                      </span>
                    ) : (
                      'Crear cuenta y publicar servicio'
                    )}
                  </button>
                </form>

                <p className="reveal mt-6 text-center text-[14px] text-muted" style={{ transitionDelay: '320ms' }}>
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
