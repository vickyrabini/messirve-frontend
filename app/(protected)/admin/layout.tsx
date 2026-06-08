import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/profile'
import { AdminNav } from './admin-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <>
      <AdminNav />
      {children}
    </>
  )
}
