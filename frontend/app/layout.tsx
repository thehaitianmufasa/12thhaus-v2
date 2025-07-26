import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '12thhaus - Spiritual Community Platform',
  description: 'Connect with verified spiritual practitioners and discover your authentic path through our AI-enhanced spiritual marketplace.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}