import Link from 'next/link'

export default function EmailVerifiedPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mx-auto mb-4">
        <svg
          className="w-8 h-8 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">Email verificado</h2>

      <p className="text-sm text-gray-500 mb-6">
        Tu correo fue verificado correctamente. Ya podés ingresar a tu cuenta.
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
