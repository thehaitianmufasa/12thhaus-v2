/**
 * 12thhaus Spiritual Platform Authentication Configuration
 * Dual user type authentication for practitioners and seekers
 */

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

// Supabase client for authentication
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Spiritual platform user types
export type SpiritualUserType = 'seeker' | 'practitioner' | 'both'

export interface SpiritualUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  userType: SpiritualUserType
  isEmailVerified: boolean
  profileImageUrl?: string
  
  // Seeker-specific fields
  seekerProfile?: {
    id: string
    displayName: string
    spiritualInterests: string[]
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    goals?: string
    birthDate?: string
    birthTime?: string
    birthLocation?: string
  }
  
  // Practitioner-specific fields
  practitionerProfile?: {
    id: string
    displayName: string
    bio?: string
    specialties: string[]
    experienceYears: number
    certifications: any[]
    hourlyRate?: number
    isVerified: boolean
    ratingAverage: number
    totalReviews: number
    isAcceptingClients: boolean
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password authentication for spiritual community
    CredentialsProvider({
      name: "spiritual-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        try {
          // Get user from database
          const { data: user, error: userError } = await supabase
            .from('users')
            .select(`
              id,
              email,
              password_hash,
              first_name,
              last_name,
              user_type,
              email_verified,
              profile_image_url,
              is_active
            `)
            .eq('email', credentials.email)
            .eq('is_active', true)
            .single()

          if (userError || !user) {
            throw new Error("Invalid email or password")
          }

          // Verify password
          const isValidPassword = await compare(credentials.password, user.password_hash)
          if (!isValidPassword) {
            throw new Error("Invalid email or password")
          }

          // Get spiritual profiles based on user type
          let seekerProfile = null
          let practitionerProfile = null

          if (user.user_type === 'seeker' || user.user_type === 'both') {
            const { data: seeker } = await supabase
              .from('seekers')
              .select(`
                id,
                display_name,
                spiritual_interests,
                experience_level,
                goals,
                birth_date,
                birth_time,
                birth_location,
                profile_image_url
              `)
              .eq('user_id', user.id)
              .single()
            
            seekerProfile = seeker
          }

          if (user.user_type === 'practitioner' || user.user_type === 'both') {
            const { data: practitioner } = await supabase
              .from('practitioners')
              .select(`
                id,
                display_name,
                bio,
                specialties,
                experience_years,
                certifications,
                hourly_rate,
                is_verified,
                rating_average,
                total_reviews,
                is_accepting_clients,
                profile_image_url
              `)
              .eq('user_id', user.id)
              .single()
            
            practitionerProfile = practitioner
          }

          // Update last login
          await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id)

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`.trim(),
            userType: user.user_type,
            isEmailVerified: user.email_verified,
            image: user.profile_image_url,
            seekerProfile,
            practitionerProfile
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error("Authentication failed")
        }
      }
    }),

    // Google OAuth for spiritual community
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          userType: 'seeker' // Default new users to seeker
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in (Google)
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id, user_type, email_verified')
            .eq('email', user.email)
            .single()

          if (!existingUser) {
            // Create new user for OAuth sign-in
            const nameParts = (user.name || '').split(' ')
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''
            
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                email: user.email,
                first_name: firstName,
                last_name: lastName,
                user_type: 'seeker',
                email_verified: true, // OAuth emails are pre-verified
                profile_image_url: user.image,
                is_active: true
              })
              .select('id')
              .single()

            if (createError || !newUser) {
              console.error('Failed to create OAuth user:', createError)
              return false
            }

            // Create default seeker profile
            await supabase
              .from('seekers')
              .insert({
                user_id: newUser.id,
                display_name: user.name || 'Spiritual Seeker',
                experience_level: 'beginner',
                profile_image_url: user.image
              })

            ;(user as any).id = newUser.id
            ;(user as any).userType = 'seeker'
          } else {
            ;(user as any).id = existingUser.id
            ;(user as any).userType = existingUser.user_type
            ;(user as any).isEmailVerified = existingUser.email_verified
          }

          return true
        } catch (error) {
          console.error('OAuth sign-in error:', error)
          return false
        }
      }

      return true
    },

    async jwt({ token, user, trigger, session }) {
      // Store spiritual user data in JWT
      if (user) {
        token.id = (user as any).id
        token.userType = (user as any).userType
        token.isEmailVerified = (user as any).isEmailVerified
        token.seekerProfile = (user as any).seekerProfile
        token.practitionerProfile = (user as any).practitionerProfile
      }

      // Handle session updates (profile changes)
      if (trigger === 'update' && session) {
        token.userType = session.userType || token.userType
        token.seekerProfile = session.seekerProfile || token.seekerProfile
        token.practitionerProfile = session.practitionerProfile || token.practitionerProfile
      }

      return token
    },

    async session({ session, token }) {
      // Pass spiritual user data to session
      if (token) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).userType = token.userType as SpiritualUserType
        ;(session.user as any).isEmailVerified = token.isEmailVerified as boolean
        ;(session.user as any).seekerProfile = token.seekerProfile as any
        ;(session.user as any).practitionerProfile = token.practitionerProfile as any
      }

      return session
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/onboarding'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Track spiritual community sign-in analytics
      console.log(`Spiritual community sign-in: ${user.email} (${(user as any).userType || 'unknown'})`)
    },
    
    async signOut({ token }) {
      // Track spiritual community sign-out analytics
      console.log(`Spiritual community sign-out: ${token?.email}`)
    }
  }
}

/**
 * Spiritual platform authentication utilities
 */
export const spiritualAuthUtils = {
  // Check if user is a practitioner
  isPractitioner: (user: any): boolean => {
    return user?.userType === 'practitioner' || user?.userType === 'both'
  },

  // Check if user is a seeker
  isSeeker: (user: any): boolean => {
    return user?.userType === 'seeker' || user?.userType === 'both'
  },

  // Check if user is verified practitioner
  isVerifiedPractitioner: (user: any): boolean => {
    return spiritualAuthUtils.isPractitioner(user) && 
           user?.practitionerProfile?.isVerified === true
  },

  // Get user's primary spiritual profile
  getPrimaryProfile: (user: any) => {
    if (user?.userType === 'practitioner') return user.practitionerProfile
    if (user?.userType === 'seeker') return user.seekerProfile
    if (user?.userType === 'both') {
      // Return practitioner profile if they have one, otherwise seeker
      return user.practitionerProfile || user.seekerProfile
    }
    return null
  },

  // Format user display name for spiritual community
  getDisplayName: (user: any): string => {
    const profile = spiritualAuthUtils.getPrimaryProfile(user)
    if (profile?.displayName) return profile.displayName
    
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    if (fullName) return fullName
    
    return user?.email?.split('@')[0] || 'Spiritual Community Member'
  }
}

export default authOptions