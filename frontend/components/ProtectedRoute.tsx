'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserTypes?: ('seeker' | 'practitioner')[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedUserTypes = ['seeker', 'practitioner'],
  redirectTo = '/auth'
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to auth page if not authenticated
        router.push(redirectTo)
        return
      }

      if (user && allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.user_type)) {
        // Redirect to appropriate dashboard if user type not allowed
        if (user.user_type === 'practitioner') {
          router.push('/dashboard/practitioner')
        } else {
          router.push('/dashboard/seeker')
        }
        return
      }
    }
  }, [user, loading, isAuthenticated, allowedUserTypes, redirectTo, router])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render anything if redirecting
  if (!isAuthenticated || (user && allowedUserTypes.length > 0 && !allowedUserTypes.includes(user.user_type))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 text-lg">Redirecting...</span>
        </div>
      </div>
    )
  }

  // Render protected content
  return <>{children}</>
}

// Higher-order component version for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedUserTypes?: ('seeker' | 'practitioner')[],
  redirectTo?: string
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute allowedUserTypes={allowedUserTypes} redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}