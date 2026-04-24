export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#72B8E6' }}>
            messirve
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Tu comunidad latina en Barcelona</p>
        </div>
        {children}
      </div>
    </div>
  )
}
