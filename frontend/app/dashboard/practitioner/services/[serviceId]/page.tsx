'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function EditServicePage() {
  const params = useParams()
  const serviceId = params.serviceId as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [service, setService] = useState<any>(null)

  const categories = [
    { id: 'divination', name: 'Divination', icon: '🔮' },
    { id: 'healing', name: 'Energy Healing', icon: '✨' },
    { id: 'astrology', name: 'Astrology', icon: '⭐' },
    { id: 'coaching', name: 'Life Coaching', icon: '🌱' },
    { id: 'meditation', name: 'Meditation', icon: '🧘' },
    { id: 'spiritual_guidance', name: 'Spiritual Guidance', icon: '🙏' }
  ]

  // Fetch service data
  useEffect(() => {
    const fetchService = async () => {
      try {
        // Simulate API call - will be replaced with GraphQL
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock service data based on service ID
        const mockService = {
          id: serviceId,
          title: 'Intuitive Tarot Reading',
          description: 'Gain deep insights into your spiritual path and life questions through intuitive tarot guidance. Each reading is personalized to your unique energy and current life situation.',
          category: 'divination',
          duration: 60,
          price: 75,
          pricingModel: 'fixed',
          sessionType: 'remote',
          serviceImage: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=400',
          tags: 'Career, Relationships, Spiritual Growth',
          requirements: 'Please come with specific questions or areas you\'d like guidance on. It\'s helpful to be in a quiet, comfortable space where you can focus.',
          whatToExpect: 'We\'ll start with a brief discussion of your questions and intentions. I\'ll then draw cards and provide detailed interpretations, connecting them to your specific situation. You\'ll have time for follow-up questions throughout the session.',
          isActive: true,
          totalBookings: 45,
          averageRating: 4.9,
          lastBooked: '2025-01-25',
          createdAt: '2024-12-15'
        }

        setService(mockService)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching service:', error)
        setLoading(false)
      }
    }

    fetchService()
  }, [serviceId])

  const handleInputChange = (field: string, value: any) => {
    setService((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // This will be replaced with actual GraphQL mutation
      console.log('Updating service:', service)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Service updated successfully!')
    } catch (error) {
      console.error('Error updating service:', error)
      alert('There was an error updating your service. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    setDeleting(true)

    try {
      // This will be replaced with actual GraphQL mutation
      console.log('Deleting service:', serviceId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('Service deleted successfully!')
      // window.location.href = '/dashboard/practitioner?tab=services'
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('There was an error deleting your service. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const toggleActiveStatus = async () => {
    const newStatus = !service.isActive
    handleInputChange('isActive', newStatus)

    try {
      // This will be replaced with actual GraphQL mutation
      console.log('Toggling service status:', serviceId, newStatus)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      alert(`Service ${newStatus ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Error toggling service status:', error)
      // Revert the change
      handleInputChange('isActive', !newStatus)
      alert('There was an error updating the service status. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 text-lg">Loading service details...</span>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h2>
          <p className="text-gray-600 mb-4">The service you're trying to edit doesn't exist.</p>
          <Link href="/dashboard/practitioner" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
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
        {/* Service Stats Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Service</h2>
              <p className="text-gray-600">Manage your "{service.title}" service</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  service.isActive 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={toggleActiveStatus}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {service.totalBookings} total bookings • ⭐ {service.averageRating}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSave} className="space-y-8">
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
                    value={service.title}
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
                    value={service.category}
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
                  value={service.description}
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
                    value={service.duration}
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
                    value={service.price}
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
                    value={service.pricingModel}
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
                      service.sessionType === 'remote'
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
                      service.sessionType === 'in_person'
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
                  value={service.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Career, Relationships, Spiritual Growth"
                />
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
                    value={service.serviceImage}
                    onChange={(e) => handleInputChange('serviceImage', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {service.serviceImage && (
                    <div className="mt-3">
                      <img
                        src={service.serviceImage}
                        alt="Service preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What to Expect (optional)
                  </label>
                  <textarea
                    value={service.whatToExpect}
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
                    value={service.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Any preparation clients should do before the session, or requirements..."
                  />
                </div>
              </div>
            </div>

            {/* Service Analytics */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Performance</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{service.totalBookings}</div>
                    <div className="text-sm text-gray-600">Total Bookings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">⭐ {service.averageRating}</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      ${(service.price * service.totalBookings).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {new Date(service.lastBooked).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Last Booked</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <div className="flex space-x-4">
                <Link
                  href="/dashboard/practitioner"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    deleting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {deleting ? 'Deleting...' : 'Delete Service'}
                </button>
              </div>
              <button
                type="submit"
                disabled={saving}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  saving
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}