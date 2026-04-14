import type { Metadata } from 'next'
import { LanguageProvider } from '@/components/LanguageProvider'
import { translations } from '@/lib/translations'
import './globals.css'

export const metadata: Metadata = {
  title: translations.es.metadata.title,
  description: translations.es.metadata.description,
  keywords: translations.es.metadata.keywords,
  openGraph: {
    title: translations.es.metadata.title,
    description: translations.es.metadata.description,
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
