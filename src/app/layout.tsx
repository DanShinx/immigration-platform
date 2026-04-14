import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Immigration Platform Spain',
  description: 'Plataforma de gestión de inmigración en España — conectamos inmigrantes con abogados especializados.',
  keywords: 'inmigración, españa, abogados, visa, residencia, permisos',
  openGraph: {
    title: 'Immigration Platform Spain',
    description: 'Plataforma de gestión de inmigración en España',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
