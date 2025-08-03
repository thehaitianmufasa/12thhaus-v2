'use client'
import Link from 'next/link'
import { useAuth, useUser } from '@clerk/nextjs'

export function Navigation() {
  const { isSignedIn, signOut } = useAuth()
  const { user } = useUser()

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link href="/services" className="text-gray-700 hover:text-purple-600 transition-colors">
        Services
      </Link>
      <Link href="/practitioners" className="text-gray-700 hover:text-purple-600 transition-colors">
        Practitioners
      </Link>
      <Link href="/community/feed" className="text-gray-700 hover:text-purple-600 transition-colors">
        Community
      </Link>
      
      {isSignedIn ? (
        <div className="flex items-center space-x-4">
          <Link 
            href={user?.unsafeMetadata?.userType === 'practitioner' ? '/dashboard/practitioner' : '/dashboard/seeker'} 
            className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
          >
            <img 
              src={user?.imageUrl} 
              alt={user?.fullName || 'Profile'} 
              className="w-8 h-8 rounded-full border-2 border-purple-200"
            />
            <span className="font-medium">{user?.firstName || 'Dashboard'}</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="text-gray-600 hover:text-red-600 transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link href="/sign-in" className="text-purple-600 hover:text-purple-700 transition-colors font-medium">
            Sign In
          </Link>
          <Link href="/sign-up" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Join Community
          </Link>
        </div>
      )}
    </nav>
  )
}
