import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/profile'
import { AdminNav } from './admin-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <AdminNav />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
