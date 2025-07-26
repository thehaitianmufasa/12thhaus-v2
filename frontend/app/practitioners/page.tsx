'use client'
import Link from 'next/link'
import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

function PractitionersPageContent() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')

  const specialties = [
    { id: 'all', name: 'All Practitioners', icon: '🌟' },
    { id: 'tarot', name: 'Tarot Reading', icon: '🔮' },
    { id: 'reiki', name: 'Reiki Healing', icon: '✨' },
    { id: 'astrology', name: 'Astrology', icon: '⭐' },
    { id: 'coaching', name: 'Life Coaching', icon: '🌱' },
    { id: 'energy', name: 'Energy Healing', icon: '💫' }
  ]

  const practitioners = [
    {
      id: 1,
      name: 'Mystic Maya Spiritual Guidance',
      practitioner: 'Maya Rodriguez',
      specialties: ['Tarot Reading', 'Energy Healing', 'Chakra Balancing'],
      category: 'tarot',
      rating: 4.9,
      sessions: 240,
      yearsExperience: 10,
      location: 'Boulder, Colorado',
      bio: 'Former corporate executive turned intuitive spiritual guide. Specializing in helping ambitious individuals navigate career transitions and spiritual awakening with confidence and clarity.',
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
      sessionTypes: ['Remote', 'In-Person'],
      languages: ['English', 'Spanish'],
      pricing: '$75-150 per session',
      verified: true
    },
    {
      id: 2,
      name: 'Sacred Healing Arts',
      practitioner: 'Dr. Keisha Johnson',
      specialties: ['Reiki Healing', 'Crystal Therapy', 'Meditation'],
      category: 'reiki',
      rating: 4.8,
      sessions: 320,
      yearsExperience: 15,
      location: 'Sedona, Arizona',
      bio: 'Licensed therapist and Reiki Master specializing in trauma healing and spiritual recovery. Expert in combining traditional therapy with energy healing modalities.',
      profile_image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
      sessionTypes: ['Remote', 'In-Person'],
      languages: ['English'],
      pricing: '$65-120 per session',
      verified: true
    },
    {
      id: 3,
      name: 'Cosmic Insights Astrology',
      practitioner: 'Sarah Chen',
      specialties: ['Natal Charts', 'Transit Readings', 'Relationship Astrology'],
      category: 'astrology',
      rating: 5.0,
      sessions: 195,
      yearsExperience: 8,
      location: 'Portland, Oregon',
      bio: 'Certified astrologer with expertise in psychological astrology and evolutionary approach. Helping clients understand their cosmic blueprint and life purpose.',
      profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      sessionTypes: ['Remote', 'In-Person'],
      languages: ['English', 'Mandarin'],
      pricing: '$100-200 per session',
      verified: true
    },
    {
      id: 4,
      name: 'Radiant Soul Coaching',
      practitioner: 'Sophia Williams',
      specialties: ['Life Coaching', 'Relationship Guidance', 'Self-Love'],
      category: 'coaching',
      rating: 4.9,
      sessions: 180,
      yearsExperience: 6,
      location: 'Austin, Texas',
      bio: 'Relationship coach and energy healer specializing in helping women reclaim their power in love and life. Expert in boundary setting and authentic self-expression.',
      profile_image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400',
      sessionTypes: ['Remote', 'In-Person'],
      languages: ['English'],
      pricing: '$80-140 per session',
      verified: true
    },
    {
      id: 5,
      name: 'Inner Light Healing',
      practitioner: 'Michael Thompson',
      specialties: ['Energy Healing', 'Shamanic Healing', 'Sound Therapy'],
      category: 'energy',
      rating: 4.7,
      sessions: 150,
      yearsExperience: 12,
      location: 'Santa Fe, New Mexico',
      bio: 'Shamanic practitioner and sound healer with training in indigenous healing traditions. Specializing in soul retrieval and spiritual cleansing.',
      profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      sessionTypes: ['In-Person'],
      languages: ['English'],
      pricing: '$90-160 per session',
      verified: true
    },
    {
      id: 6,
      name: 'Peaceful Mind Meditation',
      practitioner: 'Anna Lopez',
      specialties: ['Guided Meditation', 'Mindfulness', 'Stress Relief'],
      category: 'meditation',
      rating: 4.8,
      sessions: 280,
      yearsExperience: 5,
      location: 'San Diego, California',
      bio: 'Certified mindfulness instructor and meditation teacher. Helping busy professionals find inner peace and develop sustainable meditation practices.',
      profile_image: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=400',
      sessionTypes: ['Remote'],
      languages: ['English', 'Spanish'],
      pricing: '$40-80 per session',
      verified: true
    }
  ]

  const filteredPractitioners = selectedSpecialty === 'all' 
    ? practitioners 
    : practitioners.filter(practitioner => practitioner.category === selectedSpecialty)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-sm text-purple-600">Spiritual Practitioners</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors">
                Home
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-purple-600 transition-colors">
                Services
              </Link>
              <Link href="/practitioners" className="text-purple-600 font-medium">
                Practitioners
              </Link>
              <Link href="/auth" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Join Community
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Verified Spiritual Practitioners
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with experienced, verified practitioners offering authentic spiritual guidance
          </p>
        </div>
      </section>

      {/* Specialty Filter */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {specialties.map((specialty) => (
              <button
                key={specialty.id}
                onClick={() => setSelectedSpecialty(specialty.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
                  selectedSpecialty === specialty.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <span>{specialty.icon}</span>
                <span>{specialty.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Practitioners Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPractitioners.map((practitioner) => (
              <div
                key={practitioner.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100 overflow-hidden"
              >
                <div className="p-8">
                  {/* Profile Image & Verification */}
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <img
                      src={practitioner.profile_image}
                      alt={practitioner.practitioner}
                      className="w-full h-full object-cover rounded-full border-4 border-purple-200"
                    />
                    {practitioner.verified && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Business Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">
                    {practitioner.name}
                  </h3>
                  
                  {/* Practitioner Name */}
                  <p className="text-purple-600 font-medium mb-3 text-center">
                    {practitioner.practitioner}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {practitioner.specialties.slice(0, 2).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center justify-center space-x-4 mb-4 text-sm">
                    <span className="flex items-center text-yellow-500">
                      ⭐ {practitioner.rating}
                    </span>
                    <span className="text-gray-500">
                      {practitioner.sessions} sessions
                    </span>
                    <span className="text-gray-500">
                      {practitioner.yearsExperience}yr exp
                    </span>
                  </div>

                  {/* Location */}
                  <p className="text-center text-gray-600 text-sm mb-4">
                    📍 {practitioner.location}
                  </p>

                  {/* Bio Preview */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 text-center">
                    {practitioner.bio}
                  </p>

                  {/* Pricing */}
                  <p className="text-center text-purple-600 font-semibold mb-4">
                    {practitioner.pricing}
                  </p>

                  {/* Session Types */}
                  <div className="flex justify-center space-x-2 mb-6">
                    {practitioner.sessionTypes.map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link href={`/profile/${practitioner.id}`} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center">
                      View Profile
                    </Link>
                    <Link href={`/messages/${practitioner.id}`} className="px-4 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-center">
                      Message
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Are You a Spiritual Practitioner?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community and connect with seekers on their spiritual journey
          </p>
          <Link href="/auth/practitioner" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
            Join as Practitioner
          </Link>
        </div>
      </section>
    </div>
  )
}

export default function PractitionersPage() {
  return (
    <ProtectedRoute>
      <PractitionersPageContent />
    </ProtectedRoute>
  )
}