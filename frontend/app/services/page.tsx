'use client'
import Link from 'next/link'
import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

function ServicesPageContent() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Services', icon: '🌟' },
    { id: 'divination', name: 'Divination', icon: '🔮' },
    { id: 'healing', name: 'Energy Healing', icon: '✨' },
    { id: 'astrology', name: 'Astrology', icon: '⭐' },
    { id: 'coaching', name: 'Life Coaching', icon: '🌱' },
    { id: 'meditation', name: 'Meditation', icon: '🧘' }
  ]

  const services = [
    {
      id: 1,
      name: 'Intuitive Tarot Reading',
      price: 75,
      duration: 60,
      category: 'divination',
      practitioner: 'Mystic Maya',
      rating: 4.9,
      sessions: 240,
      description: 'Gain deep insights into your spiritual path and life questions through intuitive tarot guidance.',
      image: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=400',
      sessionType: 'Remote & In-Person',
      tags: ['Career', 'Relationships', 'Spiritual Growth']
    },
    {
      id: 2,
      name: 'Distance Reiki Healing',
      price: 65,
      duration: 45,
      category: 'healing',
      practitioner: 'Sarah Johnson',
      rating: 4.8,
      sessions: 320,
      description: 'Experience deep healing and energy balancing through universal life force energy.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      sessionType: 'Remote',
      tags: ['Healing', 'Stress Relief', 'Energy Balance']
    },
    {
      id: 3,
      name: 'Complete Natal Chart Reading',
      price: 150,
      duration: 90,
      category: 'astrology',
      practitioner: 'Dr. Keisha Johnson',
      rating: 5.0,
      sessions: 195,
      description: 'Discover your cosmic blueprint and life purpose through comprehensive birth chart analysis.',
      image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400',
      sessionType: 'Remote & In-Person',
      tags: ['Life Purpose', 'Personality', 'Timing']
    },
    {
      id: 4,
      name: 'Chakra Balancing Session',
      price: 120,
      duration: 90,
      category: 'healing',
      practitioner: 'Sophia Williams',
      rating: 4.9,
      sessions: 180,
      description: 'Align and balance your energy centers for optimal physical, emotional, and spiritual wellbeing.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      sessionType: 'In-Person',
      tags: ['Energy Work', 'Balance', 'Wellness']
    },
    {
      id: 5,
      name: 'Life Path Coaching',
      price: 100,
      duration: 60,
      category: 'coaching',
      practitioner: 'Michael Chen',
      rating: 4.7,
      sessions: 150,
      description: 'Navigate life transitions and discover your authentic path with experienced spiritual guidance.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      sessionType: 'Remote & In-Person',
      tags: ['Life Transition', 'Purpose', 'Growth']
    },
    {
      id: 6,
      name: 'Guided Meditation Session',
      price: 40,
      duration: 30,
      category: 'meditation',
      practitioner: 'Anna Lopez',
      rating: 4.8,
      sessions: 280,
      description: 'Find inner peace and clarity through personalized guided meditation practices.',
      image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400',
      sessionType: 'Remote',
      tags: ['Mindfulness', 'Peace', 'Clarity']
    }
  ]

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory)

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
                <p className="text-sm text-purple-600">Spiritual Services</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors">
                Home
              </Link>
              <Link href="/services" className="text-purple-600 font-medium">
                Services
              </Link>
              <Link href="/practitioners" className="text-gray-700 hover:text-purple-600 transition-colors">
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
            Spiritual Services
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover transformative spiritual services from verified practitioners
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100 overflow-hidden"
              >
                {/* Service Image */}
                <div className="h-48 bg-gradient-to-br from-purple-400 to-indigo-500 relative overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-purple-600">
                    ${service.price}
                  </div>
                </div>

                <div className="p-6">
                  {/* Service Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Practitioner Info */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-purple-600 font-medium">
                      {service.practitioner}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center text-yellow-500">
                        ⭐ {service.rating}
                      </span>
                      <span className="text-gray-500">
                        ({service.sessions})
                      </span>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <span>{service.duration} min</span>
                    <span>{service.sessionType}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link href={`/book/${service.id}`} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center">
                      Book Now
                    </Link>
                    <Link href={`/services/${service.id}`} className="px-4 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-center">
                      Details
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
            Ready to Begin Your Spiritual Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of seekers and practitioners today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/seeker" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
              Join as Seeker
            </Link>
            <Link href="/auth/practitioner" className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors">
              Join as Practitioner
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <ProtectedRoute>
      <ServicesPageContent />
    </ProtectedRoute>
  )
}