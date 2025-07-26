'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function PractitionerProfile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)

  // Mock practitioner data - will be replaced with real data from GraphQL
  const [practitionerProfile, setPractitionerProfile] = useState({
    name: 'Maya Rodriguez',
    email: 'maya@mysticmaya.com',
    businessName: 'Mystic Maya Spiritual Guidance',
    joinDate: 'December 2024',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
    bannerImage: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=800',
    bio: 'Former corporate executive turned intuitive spiritual guide with 10+ years of experience. Specializing in helping ambitious individuals navigate life transitions with confidence and clarity.',
    location: 'Boulder, Colorado',
    specialties: ['Tarot Reading', 'Energy Healing', 'Chakra Balancing', 'Life Coaching'],
    yearsExperience: 10,
    certifications: 'Certified Reiki Master, Professional Tarot Reader (ATA), Life Coach Certification (ICF)',
    languages: ['English', 'Spanish'],
    sessionTypes: ['Remote', 'In-Person'],
    favoriteColor: '#8B5CF6',
    isVerified: true,
    businessHours: {
      monday: { start: '09:00', end: '17:00', active: true },
      tuesday: { start: '09:00', end: '17:00', active: true },
      wednesday: { start: '09:00', end: '17:00', active: true },
      thursday: { start: '09:00', end: '17:00', active: true },
      friday: { start: '09:00', end: '17:00', active: true },
      saturday: { start: '10:00', end: '15:00', active: true },
      sunday: { start: '', end: '', active: false }
    },
    pricing: {
      baseRate: 75,
      premiumRate: 150,
      packageDiscount: 10
    }
  })

  const messages = [
    {
      id: 1,
      sender: 'Sarah Johnson',
      subject: 'Thank you for the amazing session!',
      preview: 'Your tarot reading gave me such clarity on my career path...',
      time: '2 hours ago',
      read: false,
      senderImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=100'
    },
    {
      id: 2,
      sender: 'Michael Thompson',
      subject: 'Question about follow-up session',
      preview: 'Hi Maya, I wanted to book another chakra balancing...',
      time: '1 day ago',
      read: true,
      senderImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    },
    {
      id: 3,
      sender: '12thhaus Admin',
      subject: 'New client review posted',
      preview: 'Jennifer L. left a 5-star review for your energy healing...',
      time: '2 days ago',
      read: true,
      senderImage: '/api/placeholder/100/100'
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
      sessionTypes: ['Remote', 'In-Person'],
      image: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=300'
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
      sessionTypes: ['In-Person'],
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300'
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
      sessionTypes: ['Remote', 'In-Person'],
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300'
    }
  ]

  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    sessionTypes: [],
    category: ''
  })

  const serviceCategories = [
    'Divination',
    'Energy Healing',
    'Life Coaching',
    'Meditation',
    'Astrology',
    'Crystal Healing'
  ]

  const handleSaveProfile = () => {
    setIsEditing(false)
    console.log('Profile saved:', practitionerProfile)
  }

  const handleCreateService = () => {
    if (newService.title && newService.price) {
      console.log('New service created:', newService)
      setNewService({
        title: '',
        description: '',
        price: '',
        duration: '',
        sessionTypes: [],
        category: ''
      })
    }
  }

  const colorOptions = [
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Teal', value: '#14B8A6' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/dashboard/practitioner" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-sm text-purple-600">← Back to Dashboard</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard/practitioner" className="text-gray-700 hover:text-purple-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-purple-600 transition-colors">
                Browse Community
              </Link>
              <div className="flex items-center space-x-3">
                <img
                  src={practitionerProfile.profileImage}
                  alt={practitionerProfile.name}
                  className="w-10 h-10 rounded-full border-2 border-purple-200"
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{practitionerProfile.name}</p>
                  <div className="flex items-center space-x-1">
                    <p className="text-xs text-gray-500">Master Practitioner</p>
                    {practitionerProfile.isVerified && (
                      <span className="text-green-500 text-xs">✓</span>
                    )}
                  </div>
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
              backgroundImage: `url(${practitionerProfile.bannerImage})`,
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
                    src={practitionerProfile.profileImage}
                    alt={practitionerProfile.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                  />
                  {practitionerProfile.isVerified && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {isEditing && (
                    <button className="absolute bottom-8 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
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
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={practitionerProfile.businessName}
                        onChange={(e) => setPractitionerProfile({...practitionerProfile, businessName: e.target.value})}
                        className="text-3xl font-bold text-gray-900 border-b-2 border-purple-300 focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        value={practitionerProfile.name}
                        onChange={(e) => setPractitionerProfile({...practitionerProfile, name: e.target.value})}
                        className="text-lg text-purple-600 border-b border-purple-300 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">{practitionerProfile.businessName}</h2>
                      <p className="text-lg text-purple-600 mb-2">{practitionerProfile.name}</p>
                    </div>
                  )}
                  <p className="text-gray-600 mb-1">📍 {practitionerProfile.location}</p>
                  <p className="text-gray-500 text-sm">Master Practitioner since {practitionerProfile.joinDate}</p>
                  <p className="text-gray-500 text-sm">{practitionerProfile.yearsExperience} years experience</p>
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
                  value={practitionerProfile.bio}
                  onChange={(e) => setPractitionerProfile({...practitionerProfile, bio: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tell seekers about your spiritual practice and approach..."
                />
              ) : (
                <p className="text-gray-700">{practitionerProfile.bio}</p>
              )}
            </div>

            {/* Specialties */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {practitionerProfile.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm rounded-full"
                    style={{ 
                      backgroundColor: `${practitionerProfile.favoriteColor}20`,
                      color: practitionerProfile.favoriteColor 
                    }}
                  >
                    {specialty}
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
                { id: 'services', name: 'My Services', icon: '🔮' },
                { id: 'messages', name: 'Messages', icon: '💬' },
                { id: 'business', name: 'Business Settings', icon: '🏢' },
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
                      value={practitionerProfile.name}
                      onChange={(e) => setPractitionerProfile({...practitionerProfile, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={practitionerProfile.businessName}
                      onChange={(e) => setPractitionerProfile({...practitionerProfile, businessName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={practitionerProfile.email}
                      onChange={(e) => setPractitionerProfile({...practitionerProfile, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={practitionerProfile.location}
                      onChange={(e) => setPractitionerProfile({...practitionerProfile, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      value={practitionerProfile.yearsExperience}
                      onChange={(e) => setPractitionerProfile({...practitionerProfile, yearsExperience: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                    <textarea
                      value={practitionerProfile.certifications}
                      onChange={(e) => setPractitionerProfile({...practitionerProfile, certifications: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="List your certifications and credentials..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                    <input
                      type="text"
                      value={practitionerProfile.languages.join(', ')}
                      onChange={(e) => setPractitionerProfile({...practitionerProfile, languages: e.target.value.split(', ')})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="English, Spanish, etc."
                    />
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

        {activeTab === 'services' && (
          <div className="space-y-8">
            {/* Add New Service */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Service</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
                  <input
                    type="text"
                    value={newService.title}
                    onChange={(e) => setNewService({...newService, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g. Intuitive Tarot Reading"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your service and what clients can expect..."
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Types</label>
                <div className="flex space-x-4">
                  {['Remote', 'In-Person', 'Phone'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newService.sessionTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewService({...newService, sessionTypes: [...newService.sessionTypes, type]})
                          } else {
                            setNewService({...newService, sessionTypes: newService.sessionTypes.filter(t => t !== type)})
                          }
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleCreateService}
                  className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Create Service
                </button>
              </div>
            </div>

            {/* Existing Services */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">My Services</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myServices.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
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
                        <button className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                          Edit
                        </button>
                        <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                          {service.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-8">
            {/* Business Hours */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Hours</h3>
              
              <div className="space-y-4">
                {Object.entries(practitionerProfile.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-24">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.active}
                          onChange={(e) => setPractitionerProfile({
                            ...practitionerProfile,
                            businessHours: {
                              ...practitionerProfile.businessHours,
                              [day]: { ...hours, active: e.target.checked }
                            }
                          })}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900 capitalize">{day}</span>
                      </label>
                    </div>
                    {hours.active && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={hours.start}
                          onChange={(e) => setPractitionerProfile({
                            ...practitionerProfile,
                            businessHours: {
                              ...practitionerProfile.businessHours,
                              [day]: { ...hours, start: e.target.value }
                            }
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.end}
                          onChange={(e) => setPractitionerProfile({
                            ...practitionerProfile,
                            businessHours: {
                              ...practitionerProfile.businessHours,
                              [day]: { ...hours, end: e.target.value }
                            }
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Settings */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Pricing Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Rate ($/hour)</label>
                  <input
                    type="number"
                    value={practitionerProfile.pricing.baseRate}
                    onChange={(e) => setPractitionerProfile({
                      ...practitionerProfile,
                      pricing: { ...practitionerProfile.pricing, baseRate: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Premium Rate ($/hour)</label>
                  <input
                    type="number"
                    value={practitionerProfile.pricing.premiumRate}
                    onChange={(e) => setPractitionerProfile({
                      ...practitionerProfile,
                      pricing: { ...practitionerProfile.pricing, premiumRate: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Package Discount (%)</label>
                  <input
                    type="number"
                    value={practitionerProfile.pricing.packageDiscount}
                    onChange={(e) => setPractitionerProfile({
                      ...practitionerProfile,
                      pricing: { ...practitionerProfile.pricing, packageDiscount: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleSaveProfile}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Save Business Settings
              </button>
            </div>
          </div>
        )}

        {activeTab === 'customization' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Appearance Customization</h3>
            
            <div className="space-y-8">
              {/* Theme Color */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Brand Color</h4>
                <p className="text-gray-600 mb-4">Choose your brand color for service tags and profile accents</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setPractitionerProfile({...practitionerProfile, favoriteColor: color.value})}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        practitionerProfile.favoriteColor === color.value
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

              {/* Preview */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Preview</h4>
                <div className="border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={practitionerProfile.profileImage}
                      alt={practitionerProfile.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h5 className="text-lg font-semibold text-gray-900">{practitionerProfile.businessName}</h5>
                      <p className="text-purple-600">{practitionerProfile.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {practitionerProfile.specialties.slice(0, 3).map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm rounded-full"
                        style={{ 
                          backgroundColor: `${practitionerProfile.favoriteColor}20`,
                          color: practitionerProfile.favoriteColor 
                        }}
                      >
                        {specialty}
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