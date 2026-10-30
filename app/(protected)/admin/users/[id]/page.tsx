import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { EditUserForm } from './edit-user-form'
import { AdminPageContainer } from '../../admin-page-container'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const admin = createAdminClient()
  const [{ data: authData }, { data: profile }] = await Promise.all([
    admin.auth.admin.getUserById(id),
    // FULL_NAME_DISABLED: admin.from('profiles').select('full_name, role').eq('id', id).single(),
    admin.from('profiles').select('role').eq('id', id).single(),
  ])

  if (!authData?.user || !profile) {
    notFound()
  }

  return (
    <AdminPageContainer size="narrow">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <span>←</span> Volver a usuarios
      </Link>

      <h1 className="mt-4 font-brand uppercase text-2xl text-ink">Editar usuario</h1>
      {/* FULL_NAME_DISABLED: <p className="mt-1 text-sm text-muted">Actualizá el nombre, el rol o la contraseña de la cuenta</p> */}
      <p className="mt-1 text-sm text-muted">Actualizá el rol o la contraseña de la cuenta</p>

      <EditUserForm
        userId={id}
        email={authData.user.email ?? '—'}
        // FULL_NAME_DISABLED: fullName={profile.full_name ?? ''}
        role={profile.role}
      />
    </AdminPageContainer>
  )
}
