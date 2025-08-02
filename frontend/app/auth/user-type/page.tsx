'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

export default function UserTypePage() {
  const [selectedType, setSelectedType] = useState<'seeker' | 'practitioner' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, isLoaded } = useUser()

  const handleContinue = async () => {
    if (!selectedType || !user) return
    
    setIsLoading(true)
    
    try {
      // Update user metadata with their type using the correct method
      await user.update({
        unsafeMetadata: {
          userType: selectedType
        }
      })

      // Also update in our GraphQL backend
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateUserType($userId: String!, $userType: String!) {
              updateUserType(userId: $userId, userType: $userType) {
                success
              }
            }
          `,
          variables: {
            userId: user.id,
            userType: selectedType
          }
        })
      })

      // Redirect to appropriate dashboard
      if (selectedType === 'practitioner') {
        router.push('/dashboard/practitioner')
      } else {
        router.push('/dashboard/seeker')
      }
    } catch (error) {
      console.error('Error updating user type:', error)
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">12H</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to 12thhaus!
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Let's personalize your spiritual journey. Are you here to seek guidance or offer services?
          </p>
        </div>

        {/* User Type Selection */}
        <div className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seeker Option */}
            <button
              onClick={() => setSelectedType('seeker')}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                selectedType === 'seeker'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🔮</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  I'm a Seeker
                </h3>
                <p className="text-gray-600 text-sm">
                  Looking for spiritual guidance, healing sessions, and personal growth
                </p>
                <ul className="mt-4 text-left text-sm text-gray-600 space-y-2">
                  <li>✓ Browse spiritual practitioners</li>
                  <li>✓ Book healing sessions</li>
                  <li>✓ Track your spiritual journey</li>
                  <li>✓ Join the community</li>
                </ul>
              </div>
              {selectedType === 'seeker' && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>

            {/* Practitioner Option */}
            <button
              onClick={() => setSelectedType('practitioner')}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                selectedType === 'practitioner'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">✨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  I'm a Practitioner
                </h3>
                <p className="text-gray-600 text-sm">
                  Offering spiritual services, healing sessions, and guidance to seekers
                </p>
                <ul className="mt-4 text-left text-sm text-gray-600 space-y-2">
                  <li>✓ Create your service offerings</li>
                  <li>✓ Manage client bookings</li>
                  <li>✓ Track earnings & analytics</li>
                  <li>✓ Build your spiritual practice</li>
                </ul>
              </div>
              {selectedType === 'practitioner' && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Continue Button */}
          <div className="mt-8">
            <button
              onClick={handleContinue}
              disabled={!selectedType || isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Setting up your experience...</span>
                </div>
              ) : (
                `Continue as ${selectedType === 'seeker' ? 'Seeker' : 'Practitioner'}`
              )}
            </button>
          </div>

          {/* Note */}
          <p className="text-center text-sm text-gray-500 mt-4">
            You can always switch between modes or offer services later
          </p>
        </div>
      </div>
    </div>
  )
}