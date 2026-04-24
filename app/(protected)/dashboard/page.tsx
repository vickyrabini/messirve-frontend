import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const fullName = user?.user_metadata?.full_name as string | undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#72B8E6' }}>
            messirve
          </h1>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            ¡Hola{fullName ? `, ${fullName}` : ''}!
          </h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Tu cuenta está activa. Muy pronto podrás gestionar los servicios de messirve desde
              aquí.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
