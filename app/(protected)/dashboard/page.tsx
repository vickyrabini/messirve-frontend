import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/profile'
import { DashboardShell } from './dashboard-shell'
import type { ReviewItem } from './resenas-tab'
import type { ServiceWithStats } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = await getCurrentProfile()
  const fullName = (profile?.full_name || (user?.user_metadata?.full_name as string | undefined)) ?? ''

  const [{ data: ownService }, { data: clientRequest }, { data: categories }, { data: servicesData }] = await Promise.all([
    profile?.role === 'client'
      ? supabase.from('services').select('id, name, is_active').eq('user_id', user!.id).maybeSingle()
      : Promise.resolve({ data: null }),
    profile?.role === 'user'
      ? supabase.from('client_requests').select('status, message').eq('user_id', user!.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('categories').select('id, name, slug, emoji, created_at').order('order', { ascending: true }),
    supabase.from('services').select('*, categories(name, slug, emoji)').eq('is_active', true),
  ])

  const serviceIds = (servicesData ?? []).map((s) => s.id)

  const [{ data: allLikes }, { data: allRatings }, { data: myLikes }, { data: myRatings }, { data: myComments }] = await Promise.all([
    serviceIds.length > 0 ? supabase.from('service_likes').select('service_id').in('service_id', serviceIds) : Promise.resolve({ data: [] }),
    serviceIds.length > 0
      ? supabase.from('service_ratings').select('service_id, stars').in('service_id', serviceIds)
      : Promise.resolve({ data: [] }),
    supabase.from('service_likes').select('service_id').eq('user_id', user!.id),
    supabase.from('service_ratings').select('service_id, stars, updated_at').eq('user_id', user!.id),
    supabase.from('service_comments').select('service_id, content, created_at').eq('user_id', user!.id),
  ])

  // Stats computed in memory, filtering the small in-flight arrays — same approach as the mobile app
  const exploreServices: ServiceWithStats[] = (servicesData ?? []).map((s) => {
    const sRatings = (allRatings ?? []).filter((r) => r.service_id === s.id)
    const avg = sRatings.length > 0 ? sRatings.reduce((acc, r) => acc + r.stars, 0) / sRatings.length : 0
    return {
      ...s,
      avg_rating: avg,
      total_ratings: sRatings.length,
      total_likes: (allLikes ?? []).filter((l) => l.service_id === s.id).length,
      user_liked: (myLikes ?? []).some((l) => l.service_id === s.id),
      user_rating: (myRatings ?? []).find((r) => r.service_id === s.id)?.stars ?? null,
    }
  })

  const favoriteServices = exploreServices.filter((s) => s.user_liked)

  const reviewServiceIds = new Set([...(myRatings ?? []).map((r) => r.service_id), ...(myComments ?? []).map((c) => c.service_id)])
  const reviews: ReviewItem[] = Array.from(reviewServiceIds)
    .map((id) => {
      const rating = (myRatings ?? []).find((r) => r.service_id === id)
      const comment = (myComments ?? []).find((c) => c.service_id === id)
      const service = exploreServices.find((s) => s.id === id)
      return {
        serviceId: id,
        serviceName: service?.name ?? 'Servicio',
        stars: rating?.stars ?? null,
        comment: comment?.content ?? null,
        date: rating?.updated_at ?? comment?.created_at ?? '',
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <DashboardShell
      fullName={fullName}
      email={user?.email ?? ''}
      memberSince={profile?.created_at ?? ''}
      isAdmin={profile?.role === 'admin'}
      role={profile?.role ?? 'user'}
      categories={categories ?? []}
      exploreServices={exploreServices}
      favoriteServices={favoriteServices}
      reviews={reviews}
      ownService={ownService}
      clientRequest={clientRequest}
    />
  )
}
