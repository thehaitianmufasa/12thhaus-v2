'use client'
import Link from 'next/link'
import { useAuth, useUser } from '@clerk/nextjs'

export function HeroActions() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/services" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
        Connect with Your Guide
      </Link>
      {isSignedIn ? (
        <Link 
          href={user?.unsafeMetadata?.userType === 'practitioner' ? '/dashboard/practitioner' : '/dashboard/seeker'} 
          className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors"
        >
          Go to Dashboard
        </Link>
      ) : (
        <Link href="/sign-up" className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors">
          Join Sacred Circle
        </Link>
      )}
    </div>
  )
}
