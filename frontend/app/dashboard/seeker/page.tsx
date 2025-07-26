'use client'
import Link from 'next/link'
import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

function SeekerDashboardContent() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock user data - will be replaced with real data from GraphQL
  const user = {
    name: 'Sarah',
    joinDate: 'January 2025',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
    spiritualLevel: 'Intermediate',
    completedSessions: 8,
    upcomingSessions: 2,
    favoriteServices: ['Tarot Reading', 'Reiki Healing']
  }

  const upcomingBookings = [
    {
      id: 1,
      service: 'Intuitive Tarot Reading',
      practitioner: 'Mystic Maya',
      date: '2025-01-27',
      time: '2:00 PM',
      duration: 60,
      price: 75,
      type: 'Remote',
      status: 'confirmed',
      practitionerImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=100'
    },
    {
      id: 2,
      service: 'Chakra Balancing Session',
      practitioner: 'Dr. Keisha Johnson',
      date: '2025-01-30',
      time: '10:00 AM',
      duration: 90,
      price: 120,
      type: 'In-Person',
      status: 'pending',
      practitionerImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100'
    }
  ]

  const recentSessions = [
    {
      id: 1,
      service: 'Distance Reiki Healing',
      practitioner: 'Sarah Chen',
      date: '2025-01-20',
      rating: 5,
      review: 'Amazing energy healing session. Felt so much lighter afterwards.',
      practitionerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    },
    {
      id: 2,
      service: 'Life Path Coaching',
      practitioner: 'Sophia Williams',
      date: '2025-01-15',
      rating: 4,
      review: 'Great insights into my spiritual journey and next steps.',
      practitionerImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100'
    }
  ]

  const recommendations = [
    {
      id: 1,
      title: 'Natal Chart Reading',
      practitioner: 'Cosmic Sarah',
      price: 150,
      match: 95,
      reason: 'Based on your interest in spiritual growth and life purpose',
      image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=200'
    },
    {
      id: 2,
      title: 'Crystal Healing Session',
      practitioner: 'Crystal Maya',
      price: 85,
      match: 88,
      reason: 'Perfect complement to your recent energy healing work',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200'
    }
  ]

  const spiritualJourney = {
    totalSessions: 8,
    favoritePractitioners: 3,
    journeyStarted: 'January 2025',
    nextMilestone: 'Complete 10 sessions',
    progress: 80,
    insights: [
      'You\'ve shown consistent growth in self-awareness',
      'Energy healing sessions have been particularly transformative',
      'Consider exploring astrology for deeper insights'
    ]
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
                <p className="text-sm text-purple-600">Seeker Dashboard</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/services" className="text-gray-700 hover:text-purple-600 transition-colors">
                Browse Services
              </Link>
              <Link href="/practitioners" className="text-gray-700 hover:text-purple-600 transition-colors">
                Find Practitioners
              </Link>
              <Link href="/dashboard/seeker/profile" className="text-gray-700 hover:text-purple-600 transition-colors">
                My Profile
              </Link>
              <Link href="/dashboard/seeker/profile" className="flex items-center space-x-3 hover:bg-purple-50 rounded-lg p-2 transition-colors">
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-purple-200"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Welcome, {user.name}</p>
                  <p className="text-xs text-gray-500">Seeker since {user.joinDate}</p>
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
            Welcome back, {user.name}! 🌟
          </h1>
          <p className="text-gray-600">
            Continue your spiritual journey with personalized recommendations and insights
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sessions Completed</p>
                <p className="text-2xl font-bold text-purple-600">{user.completedSessions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">✨</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-indigo-600">{user.upcomingSessions}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 text-xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Spiritual Level</p>
                <p className="text-2xl font-bold text-green-600">{user.spiritualLevel}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">🌱</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Journey Progress</p>
                <p className="text-2xl font-bold text-orange-600">{spiritualJourney.progress}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">🎯</span>
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
                { id: 'history', name: 'Session History', icon: '📜' },
                { id: 'journey', name: 'Spiritual Journey', icon: '🌟' }
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
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Sessions</h3>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                    <img
                      src={booking.practitionerImage}
                      alt={booking.practitioner}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{booking.service}</h4>
                      <p className="text-sm text-gray-600">{booking.practitioner}</p>
                      <p className="text-sm text-purple-600">{booking.date} at {booking.time}</p>
                    </div>
                    <div className="text-right">
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
                <Link href="/services" className="block w-full text-center py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
                  + Book New Session
                </Link>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recommended for You</h3>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
                    <img
                      src={rec.image}
                      alt={rec.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <p className="text-sm text-gray-600">{rec.practitioner}</p>
                      <p className="text-xs text-gray-500 mt-1">{rec.reason}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-purple-600 font-semibold">${rec.price}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {rec.match}% match
                        </span>
                      </div>
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
              <h3 className="text-xl font-bold text-gray-900">My Bookings</h3>
              <Link href="/services" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Book New Session
              </Link>
            </div>
            
            <div className="space-y-6">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img
                        src={booking.practitionerImage}
                        alt={booking.practitioner}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{booking.service}</h4>
                        <p className="text-gray-600">{booking.practitioner}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>📅 {booking.date}</span>
                          <span>🕐 {booking.time}</span>
                          <span>⏱️ {booking.duration} min</span>
                          <span>💰 ${booking.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          Reschedule
                        </button>
                        <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Session History</h3>
            
            <div className="space-y-6">
              {recentSessions.map((session) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={session.practitionerImage}
                      alt={session.practitioner}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{session.service}</h4>
                          <p className="text-gray-600">{session.practitioner}</p>
                          <p className="text-sm text-gray-500">📅 {session.date}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${
                                star <= session.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 italic">"{session.review}"</p>
                      </div>
                      <div className="mt-4 flex space-x-3">
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          Book Again
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          Message Practitioner
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'journey' && (
          <div className="space-y-8">
            {/* Journey Progress */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Spiritual Journey</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Progress to Next Milestone</h4>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Current Progress</span>
                      <span>{spiritualJourney.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${spiritualJourney.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Next milestone:</strong> {spiritualJourney.nextMilestone}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Journey Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Journey started:</span>
                      <span className="font-medium">{spiritualJourney.journeyStarted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total sessions:</span>
                      <span className="font-medium">{spiritualJourney.totalSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Favorite practitioners:</span>
                      <span className="font-medium">{spiritualJourney.favoritePractitioners}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">AI-Generated Insights</h3>
              
              <div className="space-y-4">
                {spiritualJourney.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 text-sm">✨</span>
                    </div>
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Link href="/services" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                  Explore Recommended Services
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SeekerDashboard() {
  return (
    <ProtectedRoute allowedUserTypes={['seeker']}>
      <SeekerDashboardContent />
    </ProtectedRoute>
  )
}