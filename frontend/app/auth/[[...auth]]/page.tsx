'use client'

import { SignIn, SignUp } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { clerkTheme } from '../../../lib/clerk-theme'

export const dynamic = 'force-dynamic'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get('mode') || 'signup'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">

        {mode === 'signin' ? (
          <>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Welcome back</h2>
            <p className="text-gray-600 text-center mb-8">Sign in to continue your spiritual journey</p>
            <SignIn 
              appearance={clerkTheme.appearance}
              redirectUrl="/dashboard"
            />
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Join our community</h2>
            <p className="text-gray-600 text-center mb-8">Begin your spiritual transformation today</p>
            <SignUp
              appearance={clerkTheme.appearance}
              redirectUrl="/auth/user-type"
            />
          </>
        )}
      </div>
    </div>
  )
}