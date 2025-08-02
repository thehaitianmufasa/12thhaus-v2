'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  full_name: string
  user_type: 'seeker' | 'practitioner'
  profile_image_url?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  user_type: 'seeker' | 'practitioner'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth()
  const { user: clerkUser } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Sync Clerk user with our user model
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      // Get user type from unsafe metadata or default to 'seeker'
      const userType = (clerkUser.unsafeMetadata?.userType as 'seeker' | 'practitioner') || 'seeker'
      
      setUser({
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        full_name: clerkUser.fullName || clerkUser.firstName + ' ' + clerkUser.lastName || '',
        user_type: userType,
        profile_image_url: clerkUser.imageUrl
      })
    } else {
      setUser(null)
    }
  }, [isLoaded, isSignedIn, clerkUser])

  const login = async (email: string, password: string): Promise<boolean> => {
    // With Clerk, we'll redirect to the sign-in page
    // This function is kept for compatibility but will redirect
    router.push('/auth')
    return false
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    // With Clerk, we'll redirect to the sign-up page
    // This function is kept for compatibility but will redirect
    router.push('/auth')
    return false
  }

  const logout = () => {
    signOut()
    router.push('/')
  }

  const value: AuthContextType = {
    user,
    loading: !isLoaded,
    login,
    register,
    logout,
    isAuthenticated: isSignedIn || false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}