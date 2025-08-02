'use client'

import { SignUp } from '@clerk/nextjs'
import { clerkTheme } from '../../../lib/clerk-theme'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Join our community</h2>
        <p className="text-gray-600 text-center mb-8">Begin your spiritual transformation today</p>
        <SignUp
          appearance={clerkTheme.appearance}
          redirectUrl="/auth/user-type"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  )
}