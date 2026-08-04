import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/profile'
import { ServiceForm } from './service-form'

export default async function NewServicePage() {
  const profile = await getCurrentProfile()
  if (!profile || (profile.role !== 'client' && profile.role !== 'user')) {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const [{ data: ownService }, { data: categories }] = await Promise.all([
    supabase.from('services').select('id').eq('user_id', profile.id).maybeSingle(),
    supabase.from('categories').select('id, name, slug, emoji').order('order', { ascending: true }),
  ])

  // Ya tiene un servicio propio — no dejamos crear un segundo por esta vía
  if (ownService) {
    redirect('/dashboard')
  }

  const description =
    profile.role === 'client'
      ? 'Como ya tenés una suscripción activa, tu servicio se publica de inmediato.'
      : 'Tu publicación quedará pendiente de aprobación por el equipo de Messirve. Una vez aprobada, vas a poder pagar la suscripción para que quede visible.'

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
          <span>←</span> Volver al dashboard
        </Link>

        <h1 className="mt-4 font-brand uppercase text-2xl text-ink">Publicar un servicio</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>

        <ServiceForm categories={categories ?? []} />
      </main>
    </div>
  )
}
