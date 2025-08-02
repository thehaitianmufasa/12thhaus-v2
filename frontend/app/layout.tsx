import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '12thhaus - Life & Career Coaching Platform',
  description: 'Connect with expert coaches who understand the modern woman\'s journey. Navigate career transitions, relationships, and life changes with confidence.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}