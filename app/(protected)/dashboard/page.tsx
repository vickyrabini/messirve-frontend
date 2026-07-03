import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/profile'
import { logout } from '@/app/actions/auth'
import { ServiceCard } from '@/components/service-card'
import { ClientRequestCard } from './client-request-card'
import type { ServiceWithStats } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = await getCurrentProfile()
  const fullName = user?.user_metadata?.full_name as string | undefined

  // 1. Own service (clients only) + liked service ids + own client request (users only) — parallel
  const [{ data: ownService }, { data: likes }, { data: clientRequest }] = await Promise.all([
    profile?.role === 'client'
      ? supabase.from('services').select('id').eq('user_id', user!.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('service_likes').select('service_id').eq('user_id', user!.id),
    profile?.role === 'user'
      ? supabase.from('client_requests').select('status, message').eq('user_id', user!.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])
  const serviceIds = (likes ?? []).map((l) => l.service_id)

  let likedServices: ServiceWithStats[] = []

  if (serviceIds.length > 0) {
    // 2. Services + categories
    const { data: servicesData } = await supabase
      .from('services')
      .select('*, categories(name, slug, emoji)')
      .in('id', serviceIds)
      .eq('is_active', true)

    if (servicesData) {
      // 3. Ratings for those services + the user's own
      const [{ data: ratingsData }, { data: userRatings }] = await Promise.all([
        supabase.from('service_ratings').select('service_id, stars').in('service_id', serviceIds),
        supabase.from('service_ratings').select('service_id, stars').in('service_id', serviceIds).eq('user_id', user!.id),
      ])

      // 4. Compute stats client-side, same array-filtering approach as the mobile app
      likedServices = servicesData.map((s) => {
        const sRatings = (ratingsData ?? []).filter((r) => r.service_id === s.id)
        const avg = sRatings.length > 0 ? sRatings.reduce((acc, r) => acc + r.stars, 0) / sRatings.length : 0
        return {
          ...s,
          avg_rating: avg,
          total_ratings: sRatings.length,
          total_likes: (likes ?? []).filter((l) => l.service_id === s.id).length,
          user_liked: true,
          user_rating: (userRatings ?? []).find((r) => r.service_id === s.id)?.stars ?? null,
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-gris/30 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-brand text-xl text-celeste">messirve</span>
          <div className="flex items-center gap-4">
            {profile?.role === 'admin' && (
              <Link href="/admin" className="text-sm font-semibold text-celeste-deep hover:underline">
                Panel de administración
              </Link>
            )}
            <form action={logout}>
              <button type="submit" className="cursor-pointer text-sm text-muted transition-colors hover:text-ink">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8 rounded-2xl border border-gris/30 bg-white p-8">
          <h2 className="font-brand text-2xl text-ink">¡Hola{fullName ? `, ${fullName}` : ''}!</h2>
          <p className="mt-1 text-sm text-muted">{user?.email}</p>

          {profile?.role === 'client' && (
            <Link
              href={ownService ? `/dashboard/services/${ownService.id}/edit` : '/dashboard/services/new'}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-celeste px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-celeste-dark"
            >
              {ownService ? 'Editar mi servicio' : '+ Publicar un servicio'}
            </Link>
          )}
        </div>

        {profile?.role === 'user' && <ClientRequestCard request={clientRequest} />}

        <section>
          <h3 className="font-brand text-xl text-ink">Mis favoritos</h3>
          <p className="mt-1 text-sm text-muted">Servicios que te gustaron</p>

          {likedServices.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-gris/30 bg-white p-10 text-center">
              <p className="text-4xl">💛</p>
              <p className="mt-3 text-[15px] font-semibold text-ink">Aún no tenés favoritos</p>
              <p className="mt-1 text-sm text-muted">Explorá los servicios y agregá los que más te gusten</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {likedServices.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
