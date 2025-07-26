'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function NewServicePage() {
  const [loading, setLoading] = useState(false)
  const [serviceData, setServiceData] = useState({
    title: '',
    description: '',
    category: '',
    duration: 60,
    price: 0,
    pricingModel: 'fixed',
    sessionType: 'remote',
    serviceImage: '',
    tags: '',
    requirements: '',
    whatToExpect: '',
    isActive: true
  })

  const categories = [
    { id: 'divination', name: 'Divination', icon: '🔮' },
    { id: 'healing', name: 'Energy Healing', icon: '✨' },
    { id: 'astrology', name: 'Astrology', icon: '⭐' },
    { id: 'coaching', name: 'Life Coaching', icon: '🌱' },
    { id: 'meditation', name: 'Meditation', icon: '🧘' },
    { id: 'spiritual_guidance', name: 'Spiritual Guidance', icon: '🙏' }
  ]

  const handleInputChange = (field: string, value: any) => {
    setServiceData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // This will be replaced with actual GraphQL mutation
      console.log('Creating service:', serviceData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect back to dashboard services tab
      alert('Service created successfully!')
      // window.location.href = '/dashboard/practitioner?tab=services'
    } catch (error) {
      console.error('Error creating service:', error)
      alert('There was an error creating your service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
              <Link href="/community/feed" className="text-gray-700 hover:text-purple-600 transition-colors">
                Community
              </Link>
              <Link href="/dashboard/practitioner/profile" className="text-gray-700 hover:text-purple-600 transition-colors">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Service</h2>
            <p className="text-gray-600">Add a new spiritual service to your offerings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={serviceData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Intuitive Tarot Reading"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={serviceData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Description *
                </label>
                <textarea
                  value={serviceData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your service, what it includes, and how it can help clients..."
                  required
                />
              </div>
            </div>

            {/* Pricing & Duration */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Duration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={serviceData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="15"
                    max="240"
                    step="15"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    value={serviceData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Model
                  </label>
                  <select
                    value={serviceData.pricingModel}
                    onChange={(e) => handleInputChange('pricingModel', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="sliding_scale">Sliding Scale</option>
                    <option value="donation">Donation-Based</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Session Details</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Session Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('sessionType', 'remote')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      serviceData.sessionType === 'remote'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💻</span>
                      <div>
                        <h5 className="font-semibold text-gray-900">Remote Only</h5>
                        <p className="text-sm text-gray-600">Video/phone sessions</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleInputChange('sessionType', 'in_person')}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      serviceData.sessionType === 'in_person'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏠</span>
                      <div>
                        <h5 className="font-semibold text-gray-900">In-Person Only</h5>
                        <p className="text-sm text-gray-600">At your location</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={serviceData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Career, Relationships, Spiritual Growth"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate multiple tags with commas to help clients find your service
                </p>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={serviceData.serviceImage}
                    onChange={(e) => handleInputChange('serviceImage', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What to Expect (optional)
                  </label>
                  <textarea
                    value={serviceData.whatToExpect}
                    onChange={(e) => handleInputChange('whatToExpect', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe the session flow, what clients can expect, and what you'll cover..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements or Preparation (optional)
                  </label>
                  <textarea
                    value={serviceData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Any preparation clients should do before the session, or requirements..."
                  />
                </div>
              </div>
            </div>

            {/* Service Status */}
            <div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={serviceData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Make this service active and available for booking
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                You can always change this later in your service management dashboard
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <Link
                href="/dashboard/practitioner"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  loading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {loading ? 'Creating Service...' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}