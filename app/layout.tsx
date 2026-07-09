import type { Metadata } from 'next'
import { Anton, Instrument_Sans } from 'next/font/google'
import './globals.css'

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-madimi',
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Messirve — Tu comunidad de confianza en Barcelona',
  description:
    'El directorio donde la comunidad latinoamericana en Barcelona encuentra, califica y recomienda los servicios en los que confía.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${anton.variable} ${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
