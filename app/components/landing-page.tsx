'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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

    // GSAP animations (only if available and motion is ok)
    if (reduce) return () => window.removeEventListener('scroll', onScroll)

    let cleanupGsap: (() => void) | undefined
    import('gsap').then(({ gsap }) => {
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger)

        // Floating phone
        const phoneTween = gsap.to('#phone', {
          y: '+=12',
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })

        // Parallax on glows and decorative stars
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
          phoneTween.kill()
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
              <a href="#valor" className="link-underline hover:text-ink">
                Por qué Messirve
              </a>
              <a href="#como" className="link-underline hover:text-ink">
                Cómo funciona
              </a>
              <a href="#categorias" className="link-underline hover:text-ink">
                Categorías
              </a>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center rounded-full px-4 py-2 text-[15px] font-bold text-celeste-deep hover:bg-celeste/10 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-celeste px-5 py-2.5 text-[15px] font-bold text-white shadow-soft hover:bg-celeste-dark transition-all hover:-translate-y-0.5"
              >
                Registrate
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section id="top" className="relative grain overflow-hidden pt-36 pb-20 sm:pt-40 sm:pb-28">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="float-slow absolute -top-24 -left-24 h-[34rem] w-[34rem] rounded-full bg-celeste/25 blur-3xl"
            data-parallax="0.18"
          />
          <div
            className="float-slow absolute top-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-dorado/20 blur-3xl"
            data-parallax="-0.12"
          />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-8 items-center">
          {/* Text column */}
          <div data-stagger>
            <div className="reveal inline-flex items-center gap-2 rounded-full border border-dorado/40 bg-white/70 px-4 py-1.5 text-[13px] font-bold text-celeste-deep backdrop-blur">
              <span className="text-dorado">★★★</span>
              La comunidad latina en Barcelona
            </div>

            <h1 className="reveal mt-6 font-brand text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.98] tracking-tight text-ink">
              Servicios de confianza,
              <br />
              <span className="text-celeste">
                recomendados por
                <br className="hidden sm:block" /> los tuyos.
              </span>
            </h1>

            <p className="reveal mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Messirve es el directorio donde la comunidad latinoamericana en Barcelona{' '}
              <strong className="text-ink font-semibold">encuentra, califica y recomienda</strong> los
              servicios en los que confía. Sin algoritmos. Con tu gente.
            </p>

            <div className="reveal mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-celeste px-7 py-3.5 text-[16px] font-bold text-white shadow-soft transition-all hover:bg-celeste-dark hover:-translate-y-0.5"
              >
                Registrate gratis
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border-2 border-gris/70 bg-white px-7 py-3.5 text-[16px] font-bold text-ink transition-all hover:border-celeste hover:text-celeste-deep"
              >
                Ya tengo cuenta
              </Link>
            </div>

            {/* Social proof */}
            <div className="reveal mt-9 flex items-center gap-4">
              <div className="flex -space-x-3">
                <span className="h-9 w-9 rounded-full ring-2 ring-cream bg-celeste/60 grid place-items-center text-sm">
                  🧉
                </span>
                <span className="h-9 w-9 rounded-full ring-2 ring-cream bg-dorado/50 grid place-items-center text-sm">
                  🥐
                </span>
                <span className="h-9 w-9 rounded-full ring-2 ring-cream bg-celeste/40 grid place-items-center text-sm">
                  ✂️
                </span>
                <span className="h-9 w-9 rounded-full ring-2 ring-cream bg-dorado/40 grid place-items-center text-sm">
                  🩺
                </span>
              </div>
              <p className="text-sm text-muted leading-snug">
                Reseñas reales de <strong className="text-ink font-bold">tu comunidad</strong>
                <br />
                repartidas en 7 categorías de servicios.
              </p>
            </div>
          </div>

          {/* Phone mockup column */}
          <div className="relative flex justify-center lg:justify-end">
            <div
              className="float-slow absolute -top-6 left-6 text-dorado text-2xl select-none"
              data-parallax="0.3"
            >
              ★
            </div>
            <div
              className="float-slow absolute top-24 -left-2 text-celeste text-lg select-none"
              data-parallax="0.5"
            >
              ★
            </div>

            <div
              id="phone"
              className="reveal relative w-[300px] sm:w-[340px] rounded-[2.6rem] border-[10px] border-ink/90 bg-ink"
              style={{ boxShadow: '0 50px 120px -40px rgba(47,115,163,0.55)' }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 rounded-b-2xl bg-ink z-20" />
              <div className="relative overflow-hidden rounded-[2rem] bg-cream">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-bold text-ink/70">
                  <span>9:41</span>
                  <span className="tracking-widest">●●●● ⌶</span>
                </div>

                {/* App header */}
                <div className="px-5 pt-2 pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-muted">📍 Barcelona</p>
                      <p className="font-brand text-2xl text-celeste leading-none mt-0.5">Messirve</p>
                    </div>
                    <span className="h-9 w-9 rounded-full bg-celeste/15 grid place-items-center text-celeste-deep">
                      👤
                    </span>
                  </div>
                  {/* Search */}
                  <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white border border-gris/50 px-3.5 py-2.5 text-sm text-muted shadow-sm">
                    <span>🔍</span> Buscá un servicio…
                  </div>
                </div>

                {/* Category chips */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-3">
                  <span className="shrink-0 rounded-full bg-celeste px-3 py-1.5 text-[12px] font-bold text-white">
                    Todos
                  </span>
                  <span className="shrink-0 rounded-full bg-white border border-gris/60 px-3 py-1.5 text-[12px] font-semibold text-ink/70">
                    🍽️ Gastro
                  </span>
                  <span className="shrink-0 rounded-full bg-white border border-gris/60 px-3 py-1.5 text-[12px] font-semibold text-ink/70">
                    💊 Salud
                  </span>
                  <span className="shrink-0 rounded-full bg-white border border-gris/60 px-3 py-1.5 text-[12px] font-semibold text-ink/70">
                    🏠 Hogar
                  </span>
                </div>

                {/* Service cards */}
                <div className="px-5 pb-6 space-y-3">
                  <div className="rounded-2xl bg-white border border-gris/40 p-3 shadow-sm flex gap-3">
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-celeste/15 grid place-items-center text-2xl">
                      ✂️
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-[14px] text-ink truncate">Peluquería La Porteña</p>
                        <span className="text-celeste">♥</span>
                      </div>
                      <p className="text-[11px] text-muted">Indumentaria &amp; Belleza · 1,2 km</p>
                      <p className="mt-1 text-[12px] font-bold text-dorado">
                        ★★★★★ <span className="text-muted font-semibold">4.9 · 128</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-gris/40 p-3 shadow-sm flex gap-3">
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-dorado/15 grid place-items-center text-2xl">
                      🧉
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-[14px] text-ink truncate">Almacén Don Mate</p>
                        <span className="text-gris">♡</span>
                      </div>
                      <p className="text-[11px] text-muted">Gastronomía · 600 m</p>
                      <p className="mt-1 text-[12px] font-bold text-dorado">
                        ★★★★★ <span className="text-muted font-semibold">4.8 · 96</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-gris/40 p-3 shadow-sm flex gap-3">
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-celeste/15 grid place-items-center text-2xl">
                      📋
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-[14px] text-ink truncate">Gestoría Río de la Plata</p>
                        <span className="text-gris">♡</span>
                      </div>
                      <p className="text-[11px] text-muted">Asesoría &amp; Gestoría · 2,1 km</p>
                      <p className="mt-1 text-[12px] font-bold text-dorado">
                        ★★★★<span className="text-gris">★</span>{' '}
                        <span className="text-muted font-semibold">4.6 · 54</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VALOR ============ */}
      <section id="valor" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="reveal text-sm font-bold uppercase tracking-[0.2em] text-dorado-dark">
              La propuesta de valor
            </p>
            <h2 className="reveal mt-4 font-brand text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] text-ink">
              Acá la confianza no la
              <br className="hidden sm:block" /> decide un algoritmo.{' '}
              <span className="text-celeste">La decide tu gente.</span>
            </h2>
            <p className="reveal mt-6 text-lg leading-relaxed text-muted">
              Cada recomendación viene de un compatriota que pasó por lo mismo que vos: llegar a una ciudad
              nueva y necesitar a alguien de confianza. Messirve junta esas voces en un solo lugar.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-3 gap-5" data-stagger>
            <div className="reveal group rounded-3xl border border-gris/40 bg-white p-7 shadow-card transition-all hover:-translate-y-1.5 hover:border-celeste/50">
              <div className="h-12 w-12 rounded-2xl bg-celeste/15 grid place-items-center text-2xl transition-transform group-hover:scale-110">
                🤝
              </div>
              <h3 className="mt-5 font-brand text-2xl text-ink">Reseñas reales</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                De gente que de verdad usó el servicio. Nada de reviews fantasma ni puestos para rellenar.
              </p>
            </div>

            <div className="reveal group rounded-3xl border border-gris/40 bg-white p-7 shadow-card transition-all hover:-translate-y-1.5 hover:border-celeste/50">
              <div className="h-12 w-12 rounded-2xl bg-dorado/15 grid place-items-center text-2xl transition-transform group-hover:scale-110">
                🧉
              </div>
              <h3 className="mt-5 font-brand text-2xl text-ink">Tu propia comunidad</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Rioplatenses y latinos que ya están en Barcelona y entienden lo que estás buscando.
              </p>
            </div>

            <div className="reveal group rounded-3xl border border-gris/40 bg-white p-7 shadow-card transition-all hover:-translate-y-1.5 hover:border-celeste/50">
              <div className="h-12 w-12 rounded-2xl bg-celeste/15 grid place-items-center text-2xl transition-transform group-hover:scale-110">
                ✨
              </div>
              <h3 className="mt-5 font-brand text-2xl text-ink">Cero algoritmos</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                Ordenado por confianza de la comunidad, no por quién paga más para aparecer primero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section
        id="como"
        className="relative bg-celeste-deep py-24 sm:py-32 text-white overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="float-slow pointer-events-none absolute -top-20 right-10 text-white/10 text-[10rem] font-brand select-none"
          data-parallax="0.25"
        >
          ★
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="reveal text-sm font-bold uppercase tracking-[0.2em] text-celeste-light">
              Cómo funciona
            </p>
            <h2 className="reveal mt-4 font-brand text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02]">
              En tres pasos ya estás adentro.
            </h2>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6" data-stagger>
            <div className="reveal relative rounded-3xl bg-white/5 border border-white/15 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
              <span className="font-brand text-6xl text-celeste-light/70">01</span>
              <h3 className="mt-4 font-brand text-2xl">Explorá</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                Buscá entre 7 categorías, desde un plomero hasta una peluquería que te entienda el
                acento.
              </p>
            </div>

            <div className="reveal relative rounded-3xl bg-white/5 border border-white/15 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
              <span className="font-brand text-6xl text-celeste-light/70">02</span>
              <h3 className="mt-4 font-brand text-2xl">Confiá</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                Leé las reseñas y calificaciones que dejó tu comunidad antes de decidir a quién
                llamar.
              </p>
            </div>

            <div className="reveal relative rounded-3xl bg-white/5 border border-white/15 p-8 backdrop-blur-sm transition-all hover:bg-white/10">
              <span className="font-brand text-6xl text-celeste-light/70">03</span>
              <h3 className="mt-4 font-brand text-2xl">Sumá lo tuyo</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/75">
                Guardá favoritos, calificá y dejá tu reseña para los que vienen llegando atrás tuyo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORÍAS ============ */}
      <section id="categorias" className="relative grain py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="reveal text-sm font-bold uppercase tracking-[0.2em] text-dorado-dark">
                7 categorías
              </p>
              <h2 className="reveal mt-4 font-brand text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] text-ink">
                Todo lo que necesitás, <span className="text-celeste">en un solo lugar.</span>
              </h2>
            </div>
            <p className="reveal text-[15px] text-muted max-w-sm">
              De lo cotidiano a lo importante: servicios pensados para quienes están lejos de casa.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-stagger>
            {[
              { emoji: '🏠', name: 'Hogar', desc: 'Plomeros, mudanzas, limpieza y arreglos.' },
              { emoji: '🍽️', name: 'Gastronomía', desc: 'El sabor de casa y los productos que extrañás.' },
              { emoji: '💊', name: 'Salud & Bienestar', desc: 'Profesionales que te atienden en tu idioma.' },
              { emoji: '🎨', name: 'Arte & Entretenimiento', desc: 'Eventos, música y cultura de la comunidad.' },
              { emoji: '👗', name: 'Indumentaria & Belleza', desc: 'Peluquerías, estética y moda con tu estilo.' },
              { emoji: '🏨', name: 'Hospedaje para Turistas', desc: 'Para los que vienen de visita, bien recomendado.' },
              { emoji: '📋', name: 'Asesoría & Gestoría', desc: 'Papeles, NIE, trámites y todo lo legal.' },
            ].map(({ emoji, name, desc }) => (
              <Link
                key={name}
                href="/register"
                className="reveal group rounded-3xl border border-gris/40 bg-white p-6 shadow-card transition-all hover:-translate-y-1.5 hover:border-celeste/60"
              >
                <div className="text-4xl transition-transform group-hover:scale-110 group-hover:-rotate-6">
                  {emoji}
                </div>
                <h3 className="mt-4 font-brand text-xl text-ink">{name}</h3>
                <p className="mt-1 text-[13px] text-muted">{desc}</p>
              </Link>
            ))}

            {/* CTA tile */}
            <Link
              href="/register"
              className="reveal group rounded-3xl bg-celeste p-6 shadow-soft transition-all hover:-translate-y-1.5 hover:bg-celeste-dark flex flex-col justify-between text-white"
            >
              <div className="text-3xl text-dorado-light">★★★</div>
              <div>
                <h3 className="mt-4 font-brand text-xl leading-tight">
                  Sumate y empezá
                  <br />a explorar
                </h3>
                <p className="mt-2 inline-flex items-center gap-1 text-[14px] font-bold">
                  Crear cuenta <span className="transition-transform group-hover:translate-x-1">→</span>
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="reveal relative overflow-hidden rounded-[2.5rem] border border-dorado/30 bg-white px-8 py-14 sm:px-16 sm:py-20 text-center shadow-card">
            <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-celeste/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-dorado/20 blur-3xl" />

            <div className="relative">
              <div className="text-dorado text-3xl">★★★</div>
              <h2 className="mt-5 font-brand text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.02] text-ink">
                ¿Listo para encontrar
                <br />tu gente de confianza?
              </h2>
              <p className="mt-5 mx-auto max-w-xl text-lg text-muted">
                Registrate gratis y empezá a explorar los servicios que la comunidad latina de Barcelona ya
                recomienda.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-celeste px-8 py-4 text-[16px] font-bold text-white shadow-soft transition-all hover:bg-celeste-dark hover:-translate-y-0.5"
                >
                  Crear mi cuenta
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border-2 border-gris/70 bg-white px-8 py-4 text-[16px] font-bold text-ink transition-all hover:border-celeste hover:text-celeste-deep"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-gris/40 bg-cream">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Image
                src="/messirve-logo.png"
                alt="Messirve Barcelona"
                width={120}
                height={48}
                className="h-12 w-auto"
              />
              <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-muted">
                El directorio de servicios de confianza de la comunidad latinoamericana en Barcelona.
              </p>
            </div>

            <div>
              <p className="font-brand text-lg text-ink">Producto</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-muted">
                <li>
                  <a href="#valor" className="hover:text-celeste-deep transition-colors">
                    Por qué Messirve
                  </a>
                </li>
                <li>
                  <a href="#como" className="hover:text-celeste-deep transition-colors">
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#categorias" className="hover:text-celeste-deep transition-colors">
                    Categorías
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-brand text-lg text-ink">Comunidad</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-muted">
                <li>
                  <Link href="/register" className="hover:text-celeste-deep transition-colors">
                    Sumate
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-celeste-deep transition-colors">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-celeste-deep transition-colors">
                    Sumá tu negocio
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-brand text-lg text-ink">Legal</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-muted">
                <li>
                  <Link href="/terms-and-conditions" className="hover:text-celeste-deep transition-colors">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gris/40 pt-6 text-[13px] text-muted">
            <p>© 2026 Messirve · Hecho con cariño para la comunidad en Barcelona 🧉</p>
            <p className="flex items-center gap-2">
              <span className="text-dorado">★★★</span> Mercado de servicios
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
