import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { FreeRegisterForm } from './free-register-form'

export default async function RegistroGratisPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: invite } = await admin.from('client_invites').select('email, status, expires_at').eq('token', token).single()

  const isValid = !!invite && invite.status === 'pending' && new Date(invite.expires_at) > new Date()

  if (!isValid) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-brand uppercase text-2xl text-ink">Este enlace no es válido</h1>
        <p className="mt-2 max-w-sm text-[15px] text-muted">
          Ya fue usado, está vencido o no existe. Pedile al equipo de Messirve que te genere uno nuevo.
        </p>
        <Link href="/login" className="mt-6 font-semibold text-celeste-deep hover:underline">
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  const { data: categories } = await admin.from('categories').select('id, name, slug, emoji').order('order', { ascending: true })

  return <FreeRegisterForm token={token} email={invite.email} categories={categories ?? []} />
}
