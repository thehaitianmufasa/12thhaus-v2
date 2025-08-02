'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Handle OAuth callback from Logto (Google/Apple/Email)
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')

        if (error) {
          console.error('OAuth error:', error)
          router.push('/auth?error=oauth_failed')
          return
        }

        if (code) {
          // Exchange code for tokens via your Logto integration
          const response = await fetch('http://localhost:4000/auth/logto/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, state })
          })

          if (response.ok) {
            const data = await response.json()
            
            // Store authentication data
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('user_data', JSON.stringify(data.user))
            
            // Redirect based on user type
            if (data.user.user_type === 'practitioner') {
              router.push('/dashboard/practitioner')
            } else {
              router.push('/dashboard/seeker')
            }
          } else {
            console.error('Failed to exchange code for tokens')
            router.push('/auth?error=callback_failed')
          }
        } else {
          // No code parameter, redirect back to auth
          router.push('/auth')
        }
      } catch (error) {
        console.error('Callback error:', error)
        router.push('/auth?error=unexpected_error')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">12H</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 text-lg">Completing your sign-in...</span>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Please wait while we set up your spiritual journey
        </p>
      </div>
    </div>
  )
}