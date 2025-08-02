'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export default function SeekerProfile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const { user, isLoaded } = useUser()
  
  // Real user data from Clerk with fallback defaults
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    joinDate: 'January 2025',
    profileImage: '',
    bannerImage: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=800',
    bio: 'Passionate seeker on a journey of spiritual growth and self-discovery. Love exploring energy healing, tarot, and mindfulness practices.',
    location: 'Brooklyn,NY',
    spiritualInterests: ['Tarot Reading', 'Reiki Healing', 'Meditation', 'Chakra Balancing'],
    favoriteColor: '#8B5CF6', // Purple
    privacy: 'public',
    notifications: {
      email: true,
      push: true,
      community: true
    }
  })

  // Update profile with real user data when loaded
  useEffect(() => {
    if (isLoaded && user) {
      setUserProfile(prev => ({
        ...prev,
        name: user.fullName || user.firstName + ' ' + user.lastName || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        profileImage: user.imageUrl || prev.profileImage,
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : prev.joinDate
      }))
    }
  }, [isLoaded, user])

  const messages = [
    {
      id: 1,
      sender: 'Mystic Maya',
      subject: 'Thank you for the session!',
      preview: 'I really enjoyed our tarot reading session today...',
      time: '2 hours ago',
      read: false,
      senderImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=100'
    },
    {
      id: 2,
      sender: 'Dr. Keisha Johnson',
      subject: 'Follow-up on your energy healing',
      preview: 'Hope you\'re feeling the positive energy from our session...',
      time: '1 day ago',
      read: true,
      senderImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100'
    },
    {
      id: 3,
      sender: '12thhaus Community',
      subject: 'New practitioners in your area',
      preview: 'We found some amazing new practitioners near you...',
      time: '3 days ago',
      read: true,
      senderImage: '/api/placeholder/100/100'
    }
  ]

  const communityPosts = [
    {
      id: 1,
      author: 'Sarah Johnson',
      content: 'Just had an incredible tarot reading with Mystic Maya! The insights about my career path were spot on. Feeling so grateful for this spiritual community. ✨',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3,
      image: null
    },
    {
      id: 2,
      author: 'Sarah Johnson',
      content: 'Morning meditation complete! 🧘‍♀️ Starting the day with gratitude and positive energy. What spiritual practices are you doing today?',
      timestamp: '1 day ago',
      likes: 8,
      comments: 5,
      image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400'
    }
  ]

  const [newPost, setNewPost] = useState('')

  const colorOptions = [
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Teal', value: '#14B8A6' }
  ]

  const handleSaveProfile = () => {
    setIsEditing(false)
    // TODO: Save to GraphQL API
    console.log('Profile saved:', userProfile)
  }

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      // TODO: Submit to community API
      console.log('New post:', newPost)
      setNewPost('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/dashboard/seeker" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-sm text-purple-600">← Back to Dashboard</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard/seeker" className="text-gray-700 hover:text-purple-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-purple-600 transition-colors">
                Browse Services
              </Link>
              <div className="flex items-center space-x-3">
                <img
                  src={userProfile.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400'}
                  alt={userProfile.name || 'Profile'}
                  className="w-10 h-10 rounded-full border-2 border-purple-200"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                  <p className="text-xs text-gray-500">Profile Settings</p>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header with Banner */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Banner Image */}
          <div 
            className="h-48 bg-gradient-to-r from-purple-400 to-indigo-500 relative"
            style={{
              backgroundImage: `url(${userProfile.bannerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
            {isEditing && (
              <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                Change Banner
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Profile Image */}
                <div className="relative -mt-16">
                  <img
                    src={userProfile.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400'}
                    alt={userProfile.name || 'Profile'}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                  />
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="pt-8">
                  {isEditing ? (
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="text-3xl font-bold text-gray-900 mb-2 border-b-2 border-purple-300 focus:outline-none focus:border-purple-500"
                    />
                  ) : (
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{userProfile.name}</h2>
                  )}
                  <p className="text-gray-600 mb-1">📍 {userProfile.location}</p>
                  <p className="text-gray-500 text-sm">Seeker since {userProfile.joinDate}</p>
                </div>
              </div>

              {/* Edit Button */}
              <div className="pt-8">
                {isEditing ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              {isEditing ? (
                <textarea
                  value={userProfile.bio}
                  onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tell us about your spiritual journey..."
                />
              ) : (
                <p className="text-gray-700">{userProfile.bio}</p>
              )}
            </div>

            {/* Spiritual Interests */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {userProfile.spiritualInterests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm rounded-full"
                    style={{ 
                      backgroundColor: `${userProfile.favoriteColor}20`,
                      color: userProfile.favoriteColor 
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'profile', name: 'Profile Settings', icon: '⚙️' },
                { id: 'messages', name: 'Messages', icon: '💬' },
                { id: 'community', name: 'Community Posts', icon: '🌟' },
                { id: 'customization', name: 'Appearance', icon: '🎨' }
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
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={userProfile.location}
                      onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Notifications</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                    <select
                      value={userProfile.privacy}
                      onChange={(e) => setUserProfile({...userProfile, privacy: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="public">Public - Anyone can see my profile</option>
                      <option value="community">Community - Only 12thhaus members</option>
                      <option value="private">Private - Only practitioners I've booked</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Notification Preferences</label>
                    {Object.entries(userProfile.notifications).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setUserProfile({
                            ...userProfile,
                            notifications: {
                              ...userProfile.notifications,
                              [key]: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {key === 'email' && 'Email notifications'}
                          {key === 'push' && 'Push notifications'}
                          {key === 'community' && 'Community updates'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleSaveProfile}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Save Profile Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Messages</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <img
                      src={message.senderImage}
                      alt={message.sender}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`font-semibold ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {message.sender}
                          </h4>
                          <h5 className={`text-sm ${!message.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                            {message.subject}
                          </h5>
                          <p className="text-sm text-gray-500 mt-1">{message.preview}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500">{message.time}</span>
                          {!message.read && (
                            <div className="w-3 h-3 bg-purple-600 rounded-full mt-1 ml-auto"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50">
              <Link href="/dashboard/seeker" className="text-purple-600 hover:text-purple-700 font-medium">
                View all messages →
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-6">
            {/* Quick Access to Community Feed */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Join the Spiritual Community</h3>
              <p className="mb-4 opacity-90">Connect with fellow seekers and practitioners, share your journey, and discover wisdom from our vibrant community.</p>
              <Link href="/community/feed" className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors inline-block">
                Explore Community Feed
              </Link>
            </div>

            {/* Recent Community Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">My Recent Posts</h3>
                <Link href="/community/feed" className="text-purple-600 hover:text-purple-700 font-medium">
                  View All Posts
                </Link>
              </div>
              
              {/* Recent Posts Preview */}
              <div className="space-y-4">
                {communityPosts.slice(0, 2).map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <img
                        src={userProfile.profileImage}
                        alt={post.author}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{post.author}</h4>
                          <span className="text-sm text-gray-500">• {post.timestamp}</span>
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-2">{post.content}</p>
                        
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <span>❤️</span>
                            <span>{post.likes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>{post.comments}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create New Post Button */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <Link href="/community/feed" className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Share New Post
                </Link>
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Community Activity</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">12</p>
                  <p className="text-sm text-gray-600">Posts Shared</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">84</p>
                  <p className="text-sm text-gray-600">Likes Received</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">31</p>
                  <p className="text-sm text-gray-600">Comments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">156</p>
                  <p className="text-sm text-gray-600">Community Karma</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customization' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Appearance Customization</h3>
            
            <div className="space-y-8">
              {/* Theme Color */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Theme Color</h4>
                <p className="text-gray-600 mb-4">Choose your personal theme color for tags and accents</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setUserProfile({...userProfile, favoriteColor: color.value})}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        userProfile.favoriteColor === color.value
                          ? 'border-gray-900 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-full mb-2"
                        style={{ backgroundColor: color.value }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Options */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Banner</h4>
                <p className="text-gray-600 mb-4">Upload a custom banner or choose from our collection</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="aspect-video bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-medium hover:shadow-lg transition-all">
                    Current Banner
                  </button>
                  <button className="aspect-video bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-medium hover:shadow-lg transition-all">
                    Cosmic Pink
                  </button>
                  <button className="aspect-video bg-gradient-to-r from-blue-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-medium hover:shadow-lg transition-all">
                    Ocean Blue
                  </button>
                </div>
                <div className="mt-4">
                  <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                    Upload Custom Banner
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Preview</h4>
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={userProfile.profileImage}
                      alt={userProfile.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h5 className="font-semibold text-gray-900">{userProfile.name}</h5>
                      <p className="text-sm text-gray-600">Spiritual seeker</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.spiritualInterests.slice(0, 3).map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm rounded-full"
                        style={{ 
                          backgroundColor: `${userProfile.favoriteColor}20`,
                          color: userProfile.favoriteColor 
                        }}
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleSaveProfile}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Save Appearance Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}