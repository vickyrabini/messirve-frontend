import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/profile'
import { ServiceForm } from './service-form'

export default async function NewServicePage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'client') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, emoji')
    .order('order', { ascending: true })

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
          <span>←</span> Volver al dashboard
        </Link>

        <h1 className="mt-4 font-brand text-2xl text-ink">Publicar un servicio</h1>
        <p className="mt-1 text-sm text-muted">
          Tu publicación quedará pendiente de revisión por el equipo de Messirve antes de ser visible para los demás
          usuarios.
        </p>

        <ServiceForm categories={categories ?? []} />
      </main>
    </div>
  )
}
