import Link from 'next/link'

export default function VerificationErrorPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mx-auto mb-4">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de verificación</h2>

      <p className="text-sm text-gray-500 mb-6">
        El enlace de verificación es inválido o ha expirado. Intentá registrarte nuevamente.
      </p>

      <Link
        href="/login"
        className="inline-block w-full py-2.5 px-4 text-white font-medium rounded-lg text-sm text-center transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#72B8E6' }}
      >
        Ir al inicio de sesión
      </Link>
    </div>
  )
}
