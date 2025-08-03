'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                token
                user {
                  id
                  email
                  full_name
                  user_type
                  profile_image_url
                }
                expires_in
              }
            }
          `,
          variables: { email, password }
        })
      })

      const data = await response.json()
      
      if (data.data?.login?.token && data.data?.login?.user) {
        const { token, user: userData } = data.data.login
        
        // Store auth data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        setUser(userData)
        
        // Redirect based on user type
        if (userData.user_type === 'practitioner') {
          router.push('/dashboard/practitioner')
        } else {
          router.push('/dashboard/seeker')
        }
        
        return true
      } else {
        console.error('Login failed:', data.errors || 'Invalid credentials')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
                user {
                  id
                  email
                  full_name
                  user_type
                  profile_image_url
                }
                expires_in
              }
            }
          `,
          variables: { input: userData }
        })
      })

      const data = await response.json()
      
      if (data.data?.register?.token && data.data?.register?.user) {
        const { token, user: newUser } = data.data.register
        
        // Store auth data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_data', JSON.stringify(newUser))
        
        setUser(newUser)
        
        // Redirect based on user type
        if (newUser.user_type === 'practitioner') {
          router.push('/dashboard/practitioner')
        } else {
          router.push('/dashboard/seeker')
        }
        
        return true
      } else {
        console.error('Registration failed:', data.errors || 'Registration failed')
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    setUser(null)
    router.push('/')
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
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