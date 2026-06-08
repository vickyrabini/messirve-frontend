import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/profile'
import { EditServiceForm } from './edit-service-form'

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'client') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const [{ data: service }, { data: categories }] = await Promise.all([
    supabase
      .from('services')
      .select('id, category_id, name, description, address, city, price_info, phone, website, instagram, photos, user_id')
      .eq('id', id)
      .single(),
    supabase.from('categories').select('id, name, slug, emoji').order('order', { ascending: true }),
  ])

  if (!service || service.user_id !== profile.id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-brand text-2xl text-ink">Editar servicio</h1>
        <p className="mt-1 text-sm text-muted">
          Los cambios quedarán pendientes de revisión por el equipo de Messirve antes de ser visibles.
        </p>

        <EditServiceForm service={{ ...service, photos: (service.photos as string[]) ?? [] }} categories={categories ?? []} />
      </main>
    </div>
  )
}
