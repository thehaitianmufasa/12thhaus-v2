'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function BookServicePage() {
  const params = useParams()
  const serviceId = params.serviceId as string
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [service, setService] = useState<any>(null)
  const [practitioner, setPractitioner] = useState<any>(null)
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [bookingData, setBookingData] = useState({
    selectedSlot: null,
    sessionType: 'remote',
    preparationNotes: ''
  })

  // Fetch real service data from GraphQL
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        // Fetch service data from GraphQL
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetServiceDetails($serviceId: String!) {
                service_offerings(where: {id: {_eq: $serviceId}}) {
                  id
                  title
                  description
                  price
                  duration_minutes
                  pricing_model
                  is_remote
                  is_in_person
                  service_image_url
                  requirements
                  what_to_expect
                  is_active
                  created_at
                  practitioner {
                    id
                    business_name
                    bio
                    specialties
                    years_of_experience
                    location
                    hourly_rate
                    profile_image_url
                    rating
                    total_sessions
                    total_reviews
                    user {
                      id
                      full_name
                      email
                    }
                  }
                  spiritual_discipline {
                    id
                    name
                    category
                    description
                  }
                }
                practitioner_time_slots(where: {service_offering_id: {_eq: $serviceId}, is_available: {_eq: true}}) {
                  id
                  start_time
                  end_time
                  max_bookings
                  current_bookings
                  is_available
                }
              }
            `,
            variables: { serviceId }
          })
        })

        const data = await response.json()
        console.log('Service booking data response:', data)
        
        if (data.data && data.data.service_offerings && data.data.service_offerings.length > 0) {
          const serviceData = data.data.service_offerings[0]
          
          // Transform service data
          const transformedService = {
            id: serviceData.id,
            name: serviceData.title,
            price: serviceData.price,
            duration: serviceData.duration_minutes,
            description: serviceData.description,
            image: serviceData.service_image_url || 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=400',
            sessionType: serviceData.is_remote && serviceData.is_in_person 
              ? 'Remote & In-Person' 
              : serviceData.is_remote 
              ? 'Remote Only' 
              : 'In-Person Only',
            tags: serviceData.spiritual_discipline ? [serviceData.spiritual_discipline.name] : []
          }

          // Transform practitioner data
          const transformedPractitioner = {
            id: serviceData.practitioner.id,
            name: serviceData.practitioner.user.full_name,
            businessName: serviceData.practitioner.business_name,
            profileImage: serviceData.practitioner.profile_image_url || 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
            rating: serviceData.practitioner.rating || 5.0,
            totalSessions: serviceData.practitioner.total_sessions || 0,
            yearsExperience: serviceData.practitioner.years_of_experience || 1,
            specialties: serviceData.practitioner.specialties || [],
            location: serviceData.practitioner.location || 'Remote'
          }

          // Transform time slots data
          const transformedSlots = data.data.practitioner_time_slots?.map((slot: any) => {
            const startTime = new Date(slot.start_time)
            const endTime = new Date(slot.end_time)
            
            return {
              id: slot.id,
              date: startTime.toISOString().split('T')[0],
              time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              endTime: endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              available: slot.is_available && slot.current_bookings < slot.max_bookings,
              dayOfWeek: startTime.toLocaleDateString('en-US', { weekday: 'long' })
            }
          }) || []

          setService(transformedService)
          setPractitioner(transformedPractitioner)
          setAvailableSlots(transformedSlots)
        } else {
          // Fallback to mock data if no real data found
          console.log('No real data found, using mock data for service:', serviceId)
          const mockData = getMockServiceData(serviceId)
          setService(mockData.service)
          setPractitioner(mockData.practitioner)
          setAvailableSlots(mockData.slots)
        }
      } catch (error) {
        console.error('Error fetching service data:', error)
        // Fallback to mock data on error
        const mockData = getMockServiceData(serviceId)
        setService(mockData.service)
        setPractitioner(mockData.practitioner)
        setAvailableSlots(mockData.slots)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceData()
  }, [serviceId])

  // Mock data fallback function
  const getMockServiceData = (id: string) => {
    const mockServices = {
      '1': {
        service: {
          id: '1',
          name: 'Intuitive Tarot Reading',
          price: 75,
          duration: 60,
          description: 'Gain deep insights into your spiritual path and life questions through intuitive tarot guidance. Each reading is personalized to your unique energy and current life situation.',
          image: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=400',
          sessionType: 'Remote & In-Person',
          tags: ['Career', 'Relationships', 'Spiritual Growth']
        },
        practitioner: {
          id: '1',
          name: 'Maya Rodriguez',
          businessName: 'Mystic Maya Spiritual Guidance',
          profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
          rating: 4.9,
          totalSessions: 240,
          yearsExperience: 10,
          specialties: ['Tarot Reading', 'Energy Healing', 'Chakra Balancing'],
          location: 'Boulder, Colorado'
        }
      },
      '2': {
        service: {
          id: '2',
          name: 'Distance Reiki Healing',
          price: 65,
          duration: 45,
          description: 'Experience the profound healing power of Reiki energy from the comfort of your own space. Distance Reiki is just as effective as in-person sessions.',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          sessionType: 'Remote Only',
          tags: ['Healing', 'Stress Relief', 'Energy Balance']
        },
        practitioner: {
          id: '2',
          name: 'Dr. Keisha Johnson',
          businessName: 'Sacred Healing Arts',
          profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
          rating: 4.8,
          totalSessions: 320,
          yearsExperience: 15,
          specialties: ['Reiki Healing', 'Crystal Therapy', 'Meditation', 'Trauma Recovery'],
          location: 'Sedona, Arizona'
        }
      },
      '3': {
        service: {
          id: '3',
          name: 'Complete Natal Chart Reading',
          price: 150,
          duration: 90,
          description: 'Discover your cosmic blueprint and life purpose through comprehensive birth chart analysis.',
          image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400',
          sessionType: 'Remote & In-Person',
          tags: ['Life Purpose', 'Personality', 'Timing']
        },
        practitioner: {
          id: '3',
          name: 'Sarah Chen',
          businessName: 'Cosmic Insights Astrology',
          profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
          rating: 5.0,
          totalSessions: 195,
          yearsExperience: 8,
          specialties: ['Natal Charts', 'Transit Readings', 'Relationship Astrology'],
          location: 'Portland, Oregon'
        }
      },
      '4': {
        service: {
          id: '4',
          name: 'Chakra Balancing Session',
          price: 120,
          duration: 90,
          description: 'Align and balance your energy centers for optimal physical, emotional, and spiritual wellbeing.',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          sessionType: 'In-Person Only',
          tags: ['Energy Work', 'Balance', 'Wellness']
        },
        practitioner: {
          id: '4',
          name: 'Sophia Williams',
          businessName: 'Radiant Soul Coaching',
          profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400',
          rating: 4.9,
          totalSessions: 180,
          yearsExperience: 6,
          specialties: ['Life Coaching', 'Relationship Guidance', 'Self-Love'],
          location: 'Austin, Texas'
        }
      },
      '5': {
        service: {
          id: '5',
          name: 'Life Path Coaching',
          price: 100,
          duration: 60,
          description: 'Navigate life transitions and discover your authentic path with experienced spiritual guidance.',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
          sessionType: 'Remote & In-Person',
          tags: ['Life Transition', 'Purpose', 'Growth']
        },
        practitioner: {
          id: '5',
          name: 'Michael Chen',
          businessName: 'Inner Light Healing',
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
          rating: 4.7,
          totalSessions: 150,
          yearsExperience: 12,
          specialties: ['Energy Healing', 'Shamanic Healing', 'Sound Therapy'],
          location: 'Santa Fe, New Mexico'
        }
      },
      '6': {
        service: {
          id: '6',
          name: 'Guided Meditation Session',
          price: 40,
          duration: 30,
          description: 'Find inner peace and clarity through personalized guided meditation practices.',
          image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=400',
          sessionType: 'Remote Only',
          tags: ['Mindfulness', 'Peace', 'Clarity']
        },
        practitioner: {
          id: '6',
          name: 'Anna Lopez',
          businessName: 'Peaceful Mind Meditation',
          profileImage: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=400',
          rating: 4.8,
          totalSessions: 280,
          yearsExperience: 5,
          specialties: ['Guided Meditation', 'Mindfulness', 'Stress Relief'],
          location: 'San Diego, California'
        }
      }
    }

    const defaultSlots = [
      {
        id: 'slot1',
        date: '2025-01-27',
        time: '14:00',
        endTime: '15:00',
        available: true,
        dayOfWeek: 'Monday'
      },
      {
        id: 'slot2', 
        date: '2025-01-27',
        time: '16:00',
        endTime: '17:00',
        available: true,
        dayOfWeek: 'Monday'
      },
      {
        id: 'slot3',
        date: '2025-01-28',
        time: '10:00',
        endTime: '11:00',
        available: true,
        dayOfWeek: 'Tuesday'
      },
      {
        id: 'slot4',
        date: '2025-01-28',
        time: '15:00',
        endTime: '16:00',
        available: false,
        dayOfWeek: 'Tuesday'
      },
      {
        id: 'slot5',
        date: '2025-01-29',
        time: '11:00',
        endTime: '12:00',
        available: true,
        dayOfWeek: 'Wednesday'
      }
    ]

    const serviceData = mockServices[id as keyof typeof mockServices] || mockServices['1']
    return { 
      service: serviceData.service, 
      practitioner: serviceData.practitioner, 
      slots: defaultSlots 
    }
  }

  const handleStepNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSlotSelect = (slot: any) => {
    setBookingData(prev => ({
      ...prev,
      selectedSlot: slot
    }))
  }

  const handleBookingSubmit = async () => {
    try {
      // Create booking via GraphQL mutation
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateBooking($input: BookingInput!) {
              create_spiritual_booking(input: $input) {
                id
                service_offering_id
                practitioner_id
                seeker_id
                time_slot_id
                session_type
                booking_status
                total_price
                seeker_notes
                created_at
              }
            }
          `,
          variables: {
            input: {
              service_offering_id: serviceId,
              practitioner_id: practitioner.id,
              seeker_id: 'temp-seeker-id', // This would come from authentication
              time_slot_id: bookingData.selectedSlot?.id,
              session_type: bookingData.sessionType,
              booking_status: 'pending',
              total_price: service.price,
              seeker_notes: bookingData.preparationNotes
            }
          }
        })
      })

      const data = await response.json()
      console.log('Booking creation response:', data)
      
      if (data.data && data.data.create_spiritual_booking) {
        // Booking successful
        alert('Booking confirmed! You will receive a confirmation email shortly.')
        // Could redirect to booking confirmation page here
        // window.location.href = `/bookings/${data.data.create_spiritual_booking.id}`
      } else if (data.errors) {
        console.error('GraphQL errors:', data.errors)
        alert('There was an error processing your booking. Please try again.')
      } else {
        alert('Booking submitted successfully! (Using mock confirmation until payment integration is complete)')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('There was an error processing your booking. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 text-lg">Loading booking details...</span>
        </div>
      </div>
    )
  }

  if (!service || !practitioner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service not found</h2>
          <p className="text-gray-600 mb-4">The service you're trying to book doesn't exist.</p>
          <Link href="/services" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Services
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
            <Link href="/services" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-sm text-purple-600">← Back to Services</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-purple-600 transition-colors">
                Home
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-purple-600 transition-colors">
                Services
              </Link>
              <Link href="/practitioners" className="text-gray-700 hover:text-purple-600 transition-colors">
                Practitioners
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-8 mt-4 text-sm">
            <span className={currentStep >= 1 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              Service Details
            </span>
            <span className={currentStep >= 2 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              Select Time
            </span>
            <span className={currentStep >= 3 ? 'text-purple-600 font-medium' : 'text-gray-500'}>
              Confirmation
            </span>
          </div>
        </div>

        {/* Step 1: Service Details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Details</h2>
            
            {/* Service Overview */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="md:w-1/3">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="md:w-2/3">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium ml-2">{service.duration} minutes</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium ml-2 text-purple-600">${service.price}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Session Type:</span>
                    <span className="font-medium ml-2">{service.sessionType}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {service.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Practitioner Info */}
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Practitioner</h4>
              <div className="flex items-start space-x-4">
                <img
                  src={practitioner.profileImage}
                  alt={practitioner.name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{practitioner.businessName}</h5>
                  <p className="text-purple-600 text-sm">{practitioner.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <span>⭐ {practitioner.rating} ({practitioner.totalSessions} sessions)</span>
                    <span>📍 {practitioner.location}</span>
                    <span>🎓 {practitioner.yearsExperience} years experience</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {practitioner.specialties.map((specialty: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Session Type Selection */}
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Session Preference</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setBookingData(prev => ({ ...prev, sessionType: 'remote' }))}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    bookingData.sessionType === 'remote'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💻</span>
                    <div>
                      <h5 className="font-semibold text-gray-900">Remote Session</h5>
                      <p className="text-sm text-gray-600">Connect via video call from anywhere</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setBookingData(prev => ({ ...prev, sessionType: 'in-person' }))}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    bookingData.sessionType === 'in-person'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <h5 className="font-semibold text-gray-900">In-Person Session</h5>
                      <p className="text-sm text-gray-600">Meet at practitioner's location</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleStepNext}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Select Time Slot →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Time Selection */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Available Time</h2>
              <button
                onClick={handleStepBack}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Back
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.duration} min • ${service.price}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    bookingData.selectedSlot?.id === slot.id
                      ? 'border-purple-600 bg-purple-50'
                      : slot.available
                      ? 'border-gray-200 hover:border-purple-300'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-gray-900">
                          {slot.dayOfWeek}, {new Date(slot.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </span>
                        <span className="text-purple-600 font-medium">
                          {slot.time} - {slot.endTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {bookingData.sessionType === 'remote' ? '💻 Remote Session' : '🏠 In-Person Session'}
                      </p>
                    </div>
                    <div>
                      {slot.available ? (
                        <span className="text-green-600 text-sm font-medium">Available</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Unavailable</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handleStepBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleStepNext}
                disabled={!bookingData.selectedSlot}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                  bookingData.selectedSlot
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue to Confirmation →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h2>
              <button
                onClick={handleStepBack}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                ← Back
              </button>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Practitioner:</span>
                  <span className="font-medium">{practitioner.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {bookingData.selectedSlot && (
                      <>
                        {new Date(bookingData.selectedSlot.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })} at {bookingData.selectedSlot.time}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{service.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Type:</span>
                  <span className="font-medium capitalize">{bookingData.sessionType}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-purple-600">${service.price}</span>
                </div>
              </div>
            </div>

            {/* Preparation Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Notes (Optional)
              </label>
              <textarea
                value={bookingData.preparationNotes}
                onChange={(e) => setBookingData(prev => ({ ...prev, preparationNotes: e.target.value }))}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Share any specific questions, intentions, or areas you'd like to focus on during your session..."
              />
            </div>

            {/* Terms and Conditions */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h5 className="font-semibold text-gray-900 mb-2">Booking Terms</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Cancellations must be made at least 24 hours before your session</li>
                <li>• Late arrivals may result in shortened session time</li>
                <li>• Payment is processed upon booking confirmation</li>
                <li>• You will receive session details via email confirmation</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleStepBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleBookingSubmit}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Confirm Booking & Pay ${service.price}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}