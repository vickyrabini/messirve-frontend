import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { adminUpdateService } from '@/app/actions/admin'
import { EditServiceForm } from '@/components/service-form/edit-service-form'

export default async function AdminEditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const admin = createAdminClient()
  const [{ data: service }, { data: categories }, { data: subcategories }, { data: owner }] = await Promise.all([
    admin
      .from('services')
      .select('id, category_id, subcategory_id, name, description, address, city, price_info, phone, website, instagram, photos, latitude, longitude, user_id')
      .eq('id', id)
      .single(),
    admin.from('categories').select('id, name, slug, emoji').order('order', { ascending: true }),
    admin.from('subcategories').select('id, category_id, name').order('order').order('name'),
    admin.from('admin_services_view').select('email').eq('id', id).maybeSingle(),
  ])

  if (!service) {
    notFound()
  }

  const ownerLabel = service.user_id ? `Servicio de ${owner?.email ?? '—'}` : 'Creado desde el panel'

  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-brand uppercase text-2xl text-ink">Editar servicio</h1>
        <p className="mt-1 text-sm font-medium text-ink">{ownerLabel}</p>
        <p className="mt-1 text-sm text-muted">
          Los cambios se publican al guardar y no modifican el estado de aprobación.
        </p>

        <EditServiceForm
          service={{ ...service, photos: (service.photos as string[]) ?? [] }}
          categories={categories ?? []}
          subcategories={subcategories ?? []}
          action={adminUpdateService}
          cancelHref="/admin/services"
        />
      </main>
    </div>
  )
}
