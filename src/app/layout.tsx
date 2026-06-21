import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: { default: 'SaaS Platform - Admin Dashboard', template: '%s | SaaS Platform' },
  description: 'Platform administrasi SaaS untuk mengelola pengguna.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50">
        <Providers>
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
