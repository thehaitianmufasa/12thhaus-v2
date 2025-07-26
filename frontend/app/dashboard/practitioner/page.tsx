'use client'
import Link from 'next/link'
import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

function PractitionerDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock practitioner data - will be replaced with real data from GraphQL
  const practitioner = {
    name: 'Maya Rodriguez',
    businessName: 'Mystic Maya Spiritual Guidance',
    joinDate: 'December 2024',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
    practitionerLevel: 'Master',
    totalSessions: 240,
    upcomingBookings: 5,
    monthlyEarnings: 3200,
    clientRating: 4.9,
    specialties: ['Tarot Reading', 'Energy Healing', 'Chakra Balancing'],
    isVerified: true
  }

  const upcomingBookings = [
    {
      id: 1,
      service: 'Intuitive Tarot Reading',
      client: 'Sarah J.',
      date: '2025-01-27',
      time: '2:00 PM',
      duration: 60,
      price: 75,
      type: 'Remote',
      status: 'confirmed',
      clientImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=100',
      notes: 'First-time client, interested in career guidance'
    },
    {
      id: 2,
      service: 'Chakra Balancing Session',
      client: 'Michael K.',
      date: '2025-01-27',
      time: '4:30 PM',
      duration: 90,
      price: 120,
      type: 'In-Person',
      status: 'confirmed',
      clientImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      notes: 'Regular client, focus on heart chakra'
    },
    {
      id: 3,
      service: 'Energy Healing Session',
      client: 'Jennifer L.',
      date: '2025-01-28',
      time: '10:00 AM',
      duration: 75,
      price: 95,
      type: 'Remote',
      status: 'pending',
      clientImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      notes: 'Dealing with anxiety, requested gentle approach'
    }
  ]

  const recentSessions = [
    {
      id: 1,
      service: 'Distance Reiki Healing',
      client: 'Anna M.',
      date: '2025-01-25',
      rating: 5,
      earnings: 85,
      review: 'Amazing session! Maya\'s energy healing was exactly what I needed.',
      clientImage: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=100'
    },
    {
      id: 2,
      service: 'Tarot Reading',
      client: 'David R.',
      date: '2025-01-24',
      rating: 5,
      earnings: 75,
      review: 'Incredibly accurate insights. Maya helped me see my path clearly.',
      clientImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    }
  ]

  const myServices = [
    {
      id: 1,
      title: 'Intuitive Tarot Reading',
      price: 75,
      duration: 60,
      bookings: 45,
      rating: 4.9,
      status: 'active',
      description: 'Deep insights into your spiritual path through intuitive tarot guidance.',
      sessionTypes: ['Remote', 'In-Person']
    },
    {
      id: 2,
      title: 'Chakra Balancing Session',
      price: 120,
      duration: 90,
      bookings: 32,
      rating: 4.8,
      status: 'active',
      description: 'Align and balance your energy centers for optimal wellbeing.',
      sessionTypes: ['In-Person']
    },
    {
      id: 3,
      title: 'Energy Healing Session',
      price: 95,
      duration: 75,
      bookings: 28,
      rating: 5.0,
      status: 'active',
      description: 'Experience deep healing through universal life force energy.',
      sessionTypes: ['Remote', 'In-Person']
    }
  ]

  const monthlyStats = {
    totalEarnings: 3200,
    totalSessions: 24,
    newClients: 8,
    averageRating: 4.9,
    completionRate: 98,
    responseTime: '< 2 hours'
  }

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
                <p className="text-sm text-purple-600">Practitioner Dashboard</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/services" className="text-gray-700 hover:text-purple-600 transition-colors">
                Browse Community
              </Link>
              <Link href="/practitioners" className="text-gray-700 hover:text-purple-600 transition-colors">
                Other Practitioners
              </Link>
              <Link href="/dashboard/practitioner/profile" className="text-gray-700 hover:text-purple-600 transition-colors">
                My Profile
              </Link>
              <Link href="/dashboard/practitioner/profile" className="flex items-center space-x-3 hover:bg-purple-50 rounded-lg p-2 transition-colors">
                <img
                  src={practitioner.profileImage}
                  alt={practitioner.name}
                  className="w-10 h-10 rounded-full border-2 border-purple-200"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{practitioner.name}</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-xs text-gray-500">Master Practitioner</p>
                    {practitioner.isVerified && (
                      <span className="text-green-500 text-xs">✓</span>
                    )}
                  </div>
                </div>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {practitioner.name}! ✨
          </h1>
          <p className="text-gray-600">
            Manage your spiritual practice and connect with seekers on their journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-purple-600">{practitioner.totalSessions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">✨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Bookings</p>
                <p className="text-2xl font-bold text-indigo-600">{practitioner.upcomingBookings}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                <p className="text-2xl font-bold text-green-600">${practitioner.monthlyEarnings}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Client Rating</p>
                <p className="text-2xl font-bold text-orange-600">{practitioner.clientRating}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '🏠' },
                { id: 'bookings', name: 'My Bookings', icon: '📅' },
                { id: 'services', name: 'My Services', icon: '🔮' },
                { id: 'analytics', name: 'Analytics', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Bookings */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Upcoming Sessions</h3>
                <Link href="/dashboard/practitioner/availability" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Manage Availability
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                    <img
                      src={booking.clientImage}
                      alt={booking.client}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{booking.service}</h4>
                      <p className="text-sm text-gray-600">{booking.client}</p>
                      <p className="text-sm text-purple-600">{booking.date} at {booking.time}</p>
                      <p className="text-xs text-gray-500">{booking.notes}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${booking.price}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Sessions</h3>
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                    <img
                      src={session.clientImage}
                      alt={session.client}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{session.service}</h4>
                      <p className="text-sm text-gray-600">{session.client}</p>
                      <p className="text-sm text-gray-500">{session.date}</p>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= session.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+${session.earnings}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">All Bookings</h3>
              <div className="flex space-x-3">
                <Link href="/dashboard/practitioner/availability" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Set Availability
                </Link>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Export Calendar
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={booking.clientImage}
                        alt={booking.client}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{booking.service}</h4>
                        <p className="text-gray-600">{booking.client}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>📅 {booking.date}</span>
                          <span>🕐 {booking.time}</span>
                          <span>⏱️ {booking.duration} min</span>
                          <span>📍 {booking.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2"><strong>Notes:</strong> {booking.notes}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <p className="text-lg font-semibold text-green-600">${booking.price}</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition-colors">
                          Message Client
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">My Services</h3>
              <Link href="/dashboard/practitioner/services/new" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                + Add New Service
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myServices.map((service) => (
                <div key={service.id} className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{service.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-purple-600">${service.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{service.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bookings:</span>
                      <span className="font-medium">{service.bookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium text-yellow-600">⭐ {service.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {service.sessionTypes.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/dashboard/practitioner/services/${service.id}`} className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-center text-sm font-medium">
                      Edit Service
                    </Link>
                    <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      Analytics
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Monthly Overview */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">This Month's Performance</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">${monthlyStats.totalEarnings}</p>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{monthlyStats.totalSessions}</p>
                  <p className="text-sm text-gray-600">Sessions Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{monthlyStats.newClients}</p>
                  <p className="text-sm text-gray-600">New Clients</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{monthlyStats.averageRating}</p>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{monthlyStats.completionRate}%</p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-600">{monthlyStats.responseTime}</p>
                  <p className="text-sm text-gray-600">Response Time</p>
                </div>
              </div>
            </div>

            {/* Service Performance */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Service Performance</h3>
              
              <div className="space-y-4">
                {myServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{service.title}</h4>
                      <p className="text-sm text-gray-600">{service.bookings} bookings • ⭐ {service.rating} rating</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${service.price * service.bookings}</p>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PractitionerDashboard() {
  return (
    <ProtectedRoute allowedUserTypes={['practitioner']}>
      <PractitionerDashboardContent />
    </ProtectedRoute>
  )
}