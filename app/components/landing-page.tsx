'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const CATEGORIAS = [
  { emoji: '🏠', name: 'Hogar' },
  { emoji: '🍽️', name: 'Gastronomía' },
  { emoji: '💊', name: 'Salud & Bienestar' },
  { emoji: '🎨', name: 'Arte & Entretenimiento' },
  { emoji: '👗', name: 'Indumentaria & Belleza' },
  { emoji: '🏨', name: 'Hospedaje para Turistas' },
  { emoji: '📋', name: 'Asesoría & Gestoría' },
]

export default function LandingPage() {
  const navShellRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Stagger delays for reveal groups
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      ;[...group.querySelectorAll('.reveal')].forEach((el, i) => {
        ;(el as HTMLElement).style.transitionDelay = i * 85 + 'ms'
      })
    })

    if (reduce) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in')
              io.unobserve(e.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
      )
      document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
      // Failsafe: reveal visible elements after 2.5s if observer missed them
      setTimeout(() => {
        document.querySelectorAll('.reveal:not(.in)').forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.top < window.innerHeight) el.classList.add('in')
        })
      }, 2500)
    }

    // Nav background on scroll
    const navShell = navShellRef.current
    const onScroll = () => {
      if (!navShell) return
      const on = window.scrollY > 40
      navShell.classList.toggle('bg-white/85', on)
      navShell.classList.toggle('backdrop-blur-md', on)
      navShell.classList.toggle('border-gris/40', on)
      navShell.classList.toggle('shadow-card', on)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // GSAP parallax (only if available and motion is ok)
    if (reduce) return () => window.removeEventListener('scroll', onScroll)

    let cleanupGsap: (() => void) | undefined
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger)

        const parallaxTweens: ReturnType<typeof gsap.to>[] = []
        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          const speed = parseFloat(el.getAttribute('data-parallax') || '0.15')
          const t = gsap.to(el, {
            yPercent: speed * 100,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('section') || document.body,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
          parallaxTweens.push(t)
        })

        cleanupGsap = () => {
          parallaxTweens.forEach((t) => t.kill())
          ScrollTrigger.getAll().forEach((st) => st.kill())
        }
      })
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      cleanupGsap?.()
    }
  }, [])

  return (
    <div className="font-sans text-ink antialiased overflow-x-hidden">
      {/* ============ NAV ============ */}
      <header id="nav" className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <nav
            ref={navShellRef}
            className="mt-3 flex items-center justify-between rounded-2xl border border-transparent px-4 py-2.5 transition-all duration-300"
          >
            <a href="#top" className="flex items-center gap-2 shrink-0">
              <Image src="/messirve-logo.png" alt="Messirve Barcelona" width={120} height={44} className="h-11 w-auto" />
            </a>

            <div className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-ink/80">
              <a href="#como" className="link-underline hover:text-ink">
                Cómo funciona
              </a>
              <a href="#emprendedores" className="link-underline hover:text-ink">
                Para emprendedores
              </a>
              <a href="#categorias" className="link-underline hover:text-ink">
                Categorías
              </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center rounded-full bg-celeste px-5 py-2.5 text-[15px] font-bold text-white shadow-soft hover:bg-celeste-dark transition-all hover:-translate-y-0.5"
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-celeste-deep px-5 py-2.5 text-[15px] font-bold text-white shadow-soft hover:bg-[#15212F] transition-all hover:-translate-y-0.5"
              >
                Registrarse
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section id="top" className="relative overflow-hidden bg-celeste pt-36 pb-24 sm:pt-40 sm:pb-28">
        <div
          className="float-slow pointer-events-none absolute -right-40 -top-24 h-[34rem] w-[34rem] rounded-full bg-white/10 blur-3xl"
          data-parallax="0.15"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
          <div data-stagger>
            <span className="reveal inline-block text-[15px] font-bold uppercase tracking-[0.16em] text-white/90">
              Argentinos &amp; uruguayos en Barcelona
            </span>

            <h1 className="reveal mt-6 font-brand uppercase text-[clamp(2.8rem,6.5vw,5rem)] leading-[1.02] text-white text-balance">
              Las páginas <span className="text-dorado">amarillas</span> de los nuestros
            </h1>

            <p className="reveal mt-6 max-w-xl text-lg leading-relaxed text-white/95">
              Encontrá servicios de tu comunidad, valorados por quienes entienden exactamente de dónde venís y
              qué buscás.
            </p>

            {/* Search bar */}
            <form
              action="/search"
              method="get"
              className="reveal mt-9 flex max-w-xl items-center gap-3 rounded-full bg-cream py-2.5 pl-7 pr-2.5 shadow-soft"
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#7A756A" strokeWidth={2.2} className="shrink-0">
                <circle cx={11} cy={11} r={7} />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                name="q"
                placeholder="¿Qué estás buscando? Empanadas, gestor, peluquería…"
                className="flex-1 border-none bg-transparent text-[17px] text-ink outline-none placeholder:text-muted/70"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-celeste-deep px-7 py-3 text-[16px] font-bold text-white transition-colors hover:bg-[#15212F]"
              >
                Buscar
              </button>
            </form>

            <div className="reveal mt-6 flex flex-wrap items-center gap-2.5">
              <span className="text-[15px] text-white/85">Popular:</span>
              {['Empanadas', 'Gestoría', 'Mudanzas'].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full bg-white/15 px-4 py-1.5 text-[15px] font-semibold text-white transition-colors hover:bg-white/25"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          {/* Floating review card */}
          <div className="relative">
            <div className="reveal rounded-3xl bg-cream p-8" style={{ boxShadow: '0 30px 70px -20px rgba(27,42,61,0.35)' }}>
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-celeste font-brand text-2xl text-white">
                  V
                </div>
                <div>
                  <p className="text-[19px] font-semibold text-ink">Empanadas del barrio</p>
                  <p className="text-[15px] text-muted">Gastronomía · Gràcia</p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <span className="text-dorado text-lg tracking-[2px]">★★★★★</span>
                <span className="font-brand text-lg text-ink">5,0</span>
                <span className="text-[14px] text-muted">· 48 reseñas</span>
              </div>
              <p className="mt-4 text-[17px] italic leading-relaxed text-[#43413B]">
                &quot;Tal cual las de la esquina de casa. De diez.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="como" className="relative grain py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center">
            <p className="reveal text-sm font-bold uppercase tracking-[0.2em] text-dorado-dark">Para usuarios</p>
            <h2 className="reveal mt-4 font-brand uppercase text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] text-ink">
              Cómo funciona
            </h2>
          </div>

          <div className="mt-14 grid sm:grid-cols-3 gap-6" data-stagger>
            <div className="reveal rounded-3xl border border-gris/40 bg-white p-9">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-celeste font-brand text-3xl text-white">1</div>
              <h3 className="mt-6 font-brand uppercase text-2xl text-ink">Buscá</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">
                El servicio que necesitás en Barcelona, filtrado por rubro.
              </p>
            </div>
            <div className="reveal rounded-3xl border border-gris/40 bg-white p-9">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-dorado font-brand text-3xl text-celeste-deep">2</div>
              <h3 className="mt-6 font-brand uppercase text-2xl text-ink">Compará</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">
                Reseñas y valoraciones reales de tus compatriotas.
              </p>
            </div>
            <div className="reveal rounded-3xl border border-gris/40 bg-white p-9">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-celeste-deep font-brand text-3xl text-white">3</div>
              <h3 className="mt-6 font-brand uppercase text-2xl text-ink">Contactá</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">
                Al emprendedor directamente, usando tu medio preferido.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-celeste-deep px-9 py-4 text-[17px] font-bold uppercase tracking-wide text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-[#15212F]"
            >
              Sumate gratis
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA EMPRENDEDORES ============ */}
      <section id="emprendedores" className="relative bg-celeste-deep overflow-hidden">
        <div
          className="float-slow pointer-events-none absolute -left-24 -bottom-24 h-[24rem] w-[24rem] rounded-full bg-white/10 blur-3xl"
          data-parallax="0.15"
        />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 sm:py-24 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl" data-stagger>
            <p className="reveal text-sm font-bold uppercase tracking-[0.2em] text-celeste-light">
              Para emprendedores
            </p>
            <h2 className="reveal mt-4 font-brand uppercase text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] text-white">
              ¿Emprendés en Barcelona?
            </h2>
            <p className="reveal mt-5 text-lg leading-relaxed text-white/85">
              Sumá tu servicio para no quedarte afuera de la comunidad rioplatense en la ciudad. Tus compatriotas te
              necesitan.
            </p>
          </div>
          <Link
            href="/register"
            className="reveal group shrink-0 inline-flex items-center gap-2 rounded-full bg-dorado px-10 py-5 text-[18px] font-bold uppercase tracking-wide text-celeste-deep shadow-soft transition-all hover:-translate-y-0.5 hover:bg-dorado-light"
          >
            Suscribite
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* ============ CATEGORÍAS ============ */}
      <section id="categorias" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center">
            <p className="reveal text-sm font-bold uppercase tracking-[0.2em] text-dorado-dark">Todo lo nuestro</p>
            <h2 className="reveal mt-4 font-brand uppercase text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] text-ink">
              Explorá por categoría
            </h2>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4" data-stagger>
            {CATEGORIAS.map((c, i) => (
              <Link
                key={c.name}
                href="/register"
                className={`reveal rounded-full px-6 py-3 text-[16px] font-semibold shadow-soft transition-all hover:-translate-y-0.5 ${
                  i % 2 === 0 ? 'bg-celeste text-white hover:bg-celeste-dark' : 'bg-dorado text-celeste-deep hover:bg-dorado-light'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-celeste-deep">
        <div className="text-center py-9 px-5">
          <span className="font-brand uppercase text-3xl tracking-[0.06em] text-dorado">Messirve te sirve</span>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 pb-14 sm:flex-row sm:justify-between sm:px-8">
          <Image src="/messirve-logo.png" alt="Messirve Barcelona" width={120} height={44} className="h-[70px] w-auto" />
          <div className="flex flex-wrap items-center justify-center gap-8">
            <a href="#" className="text-[16px] text-white/75 transition-colors hover:text-white">
              Sobre nosotros
            </a>
            <a href="#" className="text-[16px] text-white/75 transition-colors hover:text-white">
              Contacto
            </a>
            <Link href="/terms-and-conditions" className="text-[16px] text-white/75 transition-colors hover:text-white">
              Términos
            </Link>
            <Link href="/terms-and-conditions" className="text-[16px] text-white/75 transition-colors hover:text-white">
              Privacidad
            </Link>
          </div>
          <span className="text-[15px] text-white/50">© 2026 Messirve · Barcelona</span>
        </div>
      </footer>
    </div>
  )
}
