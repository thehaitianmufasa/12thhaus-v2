'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const dynamic = 'force-dynamic'

export default function DashboardRedirect() {
  const { user, isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user && isSignedIn) {
      const userType = user.unsafeMetadata?.userType as 'seeker' | 'practitioner' | undefined
      
      if (!userType) {
        // User hasn't set their type yet, redirect to selection
        router.push('/auth/user-type')
      } else if (userType === 'seeker') {
        router.push('/dashboard/seeker')
      } else if (userType === 'practitioner') {
        router.push('/dashboard/practitioner')
      }
    } else if (isLoaded && !isSignedIn) {
      // Not signed in, redirect to auth
      router.push('/auth?mode=signin')
    }
  }, [isLoaded, user, isSignedIn, router])

  // Show loading spinner while determining redirect
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  )
}