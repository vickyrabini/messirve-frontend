import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-cream">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-brand text-2xl text-ink">Panel de administración</h1>
        <p className="mt-1 text-sm text-muted">Gestioná usuarios y servicios de la plataforma</p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            href="/admin/users"
            className="rounded-2xl border border-gris/30 bg-white p-6 transition-colors hover:border-celeste/50"
          >
            <p className="text-3xl">🧑‍💼</p>
            <h2 className="mt-3 font-brand text-lg text-ink">Gestionar usuarios</h2>
            <p className="mt-1 text-sm text-muted">Buscá usuarios y editá su nombre, rol o contraseña</p>
          </Link>

          <Link
            href="/admin/services"
            className="rounded-2xl border border-gris/30 bg-white p-6 transition-colors hover:border-celeste/50"
          >
            <p className="text-3xl">📋</p>
            <h2 className="mt-3 font-brand text-lg text-ink">Gestionar servicios</h2>
            <p className="mt-1 text-sm text-muted">Activá o desactivá los servicios publicados</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
