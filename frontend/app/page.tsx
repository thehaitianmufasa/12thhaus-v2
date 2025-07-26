'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [featuredPractitioners, setFeaturedPractitioners] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch real practitioners from GraphQL
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                practitioners(limit: 3) {
                  id
                  user_id
                  business_name
                  bio
                  specialties
                  years_of_experience
                  rating
                  total_sessions
                  profile_image_url
                  user {
                    id
                    full_name
                  }
                }
              }
            `
          })
        })
        
        const data = await response.json()
        if (data.data && data.data.practitioners) {
          // Transform the practitioners data
          const transformedPractitioners = data.data.practitioners.map(practitioner => ({
            id: practitioner.user_id, // Use user_id for profile linking
            name: practitioner.business_name || practitioner.user?.full_name || 'Spiritual Practitioner',
            specialties: practitioner.specialties?.slice(0, 2).join(', ') || 'Spiritual Guidance',
            rating: practitioner.rating?.toFixed(1) || '4.9',
            sessions: practitioner.total_sessions?.toString() || '0',
            bio: practitioner.bio || 'Experienced spiritual practitioner offering authentic guidance.',
            profile_image_url: practitioner.profile_image_url || 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400'
          }))
          
          setFeaturedPractitioners(transformedPractitioners)
        }
      } catch (error) {
        console.error('Error fetching practitioners:', error)
        // Fallback to mock data
        setFeaturedPractitioners([
          {
            id: 'fallback-1',
            name: 'Jasmine Washington',
            specialties: 'Career Intuition, Life Transitions',
            rating: '4.9',
            sessions: '240',
            bio: 'Former corporate executive turned intuitive coach. Specializing in helping ambitious women navigate career pivots and life transitions with confidence.',
            profile_image_url: 'https://t4.ftcdn.net/jpg/02/76/94/85/360_F_276948525_rdTb1EKACpjnnA5XyRKLQC2lBYPVi7vQ.jpg'
          },
          {
            id: 'fallback-2',
            name: 'Dr. Keisha Johnson',
            specialties: 'Mindfulness, Stress Management',
            rating: '4.8',
            sessions: '320',
            bio: 'Licensed therapist and mindfulness expert helping busy professionals find balance. Perfect for managing work-life stress and anxiety.',
            profile_image_url: 'https://t4.ftcdn.net/jpg/01/96/09/21/360_F_196092169_tqXVrlcZnpt0mDaNFqq5Ife4q01GYDXH.jpg'
          },
          {
            id: 'fallback-3',
            name: 'Sophia Williams',
            specialties: 'Relationship Guidance, Self-Love',
            rating: '5.0',
            sessions: '195',
            bio: 'Relationship coach and energy healer specializing in helping women reclaim their power in love and life. Expert in boundary setting.',
            profile_image_url: 'https://t3.ftcdn.net/jpg/04/17/85/08/360_F_417850826_ZQ98ggEKoZcqFjfLSgmBwYPHu1Tc4MGU.jpg'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPractitioners()
  }, [])

  const services = [
    {
      id: 1,
      name: 'Tarot Reading',
      price: '75',
      icon: '🔮',
      description: 'Gain insights into your spiritual path through intuitive tarot guidance'
    },
    {
      id: 2,
      name: 'Reiki Healing',
      price: '65',
      icon: '✨',
      description: 'Experience deep healing through universal life force energy'
    },
    {
      id: 3,
      name: 'Astrology Reading',
      price: '150',
      icon: '⭐',
      description: 'Discover your cosmic blueprint and life purpose through the stars'
    }
  ]

  const features = [
    {
      title: 'Verified Practitioners',
      description: 'All spiritual practitioners are carefully vetted and verified for authentic, professional service.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'AI-Enhanced Matching',
      description: 'Our intelligent system connects you with practitioners perfectly aligned to your spiritual journey.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: 'Spiritual Community',
      description: 'Join a supportive community of seekers and practitioners on similar spiritual paths.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-sm text-purple-600">Spiritual Community Platform</p>
              </div>
            </div>
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
              <Link href="/auth" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Join Community
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Spiritual Path
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with verified spiritual practitioners, explore transformative services, 
            and join a community dedicated to authentic spiritual growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
              Find Your Guide
            </Link>
            <Link href="/auth" className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors">
              Join Community
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose 12thhaus?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines ancient wisdom with modern technology to create meaningful spiritual connections
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Practitioners Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Practitioners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with verified spiritual practitioners offering authentic guidance and healing services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading state
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden animate-pulse">
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-2/3 mx-auto"></div>
                    <div className="h-16 bg-gray-200 rounded mb-6"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredPractitioners.map((practitioner, index) => (
                <div
                  key={practitioner.id || index}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100 overflow-hidden"
                >
                  <div className="p-8 text-center">
                    {/* Profile Image */}
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-purple-200">
                      <img
                        src={practitioner.profile_image_url}
                        alt={practitioner.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {practitioner.name}
                    </h3>
                    
                    {/* Specialties */}
                    <p className="text-purple-600 font-medium mb-3">
                      {practitioner.specialties}
                    </p>
                    
                    {/* Rating and Sessions */}
                    <div className="flex items-center justify-center space-x-4 mb-4 text-sm">
                      <span className="flex items-center text-yellow-500">
                        ⭐ {practitioner.rating}
                      </span>
                      <span className="text-gray-500">
                        {practitioner.sessions} sessions
                      </span>
                    </div>
                    
                    {/* Bio Preview */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                      {practitioner.bio}
                    </p>
                    
                    {/* Action Button - Fixed to link to individual profiles */}
                    <Link href={`/profile/${practitioner.id}`} className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center">
                      View Profile
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Spiritual Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover transformative spiritual services tailored to your journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100"
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {service.description}
                  </p>
                  <div className="text-2xl font-bold text-purple-600 mb-4">
                    ${service.price}
                  </div>
                  <Link href={`/book/${service.id}`} className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium text-center">
                    Book Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">12H</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">12thhaus</h3>
                <p className="text-sm text-gray-400">Spiritual Community Platform</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2025 12thhaus. All rights reserved.</p>
              <p className="text-sm text-gray-500 mt-1">Connecting souls, transforming lives</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}