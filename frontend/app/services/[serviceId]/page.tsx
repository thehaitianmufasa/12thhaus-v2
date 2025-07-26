'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ServiceDetailsPage() {
  const params = useParams()
  const serviceId = params.serviceId as string
  const [service, setService] = useState<any>(null)
  const [practitioner, setPractitioner] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    const fetchServiceDetails = async () => {
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
              }
            `,
            variables: { serviceId }
          })
        })

        const data = await response.json()
        console.log('Service details response for serviceId:', serviceId, data)
        
        if (data.data && data.data.service_offerings && data.data.service_offerings.length > 0) {
          const serviceData = data.data.service_offerings[0]
          console.log('Using real GraphQL data:', serviceData)
          setService(serviceData)
          setPractitioner(serviceData.practitioner)
        } else {
          // Fallback to mock data if GraphQL fails
          console.log('No GraphQL data found, using mock data for service:', serviceId)
          const mockService = getMockServiceData(serviceId)
          console.log('Mock service data:', mockService)
          setService(mockService.service)
          setPractitioner(mockService.practitioner)
        }
      } catch (error) {
        console.error('Error fetching service details:', error)
        // Fallback to mock data
        const mockService = getMockServiceData(serviceId)
        setService(mockService.service)
        setPractitioner(mockService.practitioner)
      } finally {
        setLoading(false)
      }
    }

    fetchServiceDetails()
  }, [serviceId])

  const getMockServiceData = (id: string) => {
    const mockServices = {
      '1': {
        service: {
          id: '1',
          title: 'Intuitive Tarot Reading',
          description: 'Unlock the wisdom of the cards and gain profound insights into your spiritual path, relationships, and life decisions. This comprehensive tarot reading combines traditional card meanings with intuitive guidance to provide you with clarity and direction on your journey.\n\nDuring our session, I will create a sacred space where we can explore the messages the universe has for you. Whether you are facing important decisions, seeking guidance on relationships, or looking to understand your spiritual purpose, the tarot cards will serve as a bridge between your conscious mind and your higher wisdom.\n\nEach reading is personalized to your unique energy and current life situation. I work with multiple tarot decks and will choose the one that resonates most strongly with your energy during our session.',
          price: 75,
          duration_minutes: 60,
          pricing_model: 'fixed',
          is_remote: true,
          is_in_person: true,
          service_image_url: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=800&h=600&fit=crop',
          requirements: 'Please come with specific questions or areas you would like guidance on. It is helpful to be in a quiet, comfortable space where you can focus. Have a notebook ready to jot down important insights.',
          what_to_expect: 'We will start with a brief discussion of your questions and intentions for the reading. I will then shuffle and draw cards, providing detailed interpretations and connecting them to your specific situation. You will have time for follow-up questions throughout the session, and I will conclude with practical guidance on how to apply the insights in your daily life.',
          is_active: true
        },
        practitioner: {
          id: '1',
          business_name: 'Mystic Maya Spiritual Guidance',
          bio: 'Former corporate executive who found her calling after a transformative spiritual awakening in 2015. I specialize in helping ambitious individuals navigate career transitions and spiritual awakening with confidence and clarity. My approach combines traditional tarot wisdom with modern psychological insights.',
          specialties: ['Tarot Reading', 'Energy Healing', 'Chakra Balancing', 'Career Guidance'],
          years_of_experience: 10,
          location: 'Boulder, Colorado',
          profile_image_url: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400&fit=crop&crop=face',
          rating: 4.9,
          total_sessions: 287,
          total_reviews: 156,
          user: {
            id: '1',
            full_name: 'Maya Rodriguez',
            email: 'maya@mysticmaya.com'
          }
        }
      },
      '2': {
        service: {
          id: '2',
          title: 'Distance Reiki Healing',
          description: 'Experience the profound healing power of Reiki energy from the comfort of your own space. Distance Reiki is just as effective as in-person sessions, as energy transcends physical boundaries and flows where it is needed most.\n\nDuring this session, I will connect with your energy field and channel universal life force energy to promote healing, balance, and relaxation. Many clients report feeling warmth, tingling, or deep peace during and after the session. This gentle yet powerful healing modality works on physical, emotional, mental, and spiritual levels.\n\nReiki helps to clear energy blockages, reduce stress and anxiety, promote better sleep, and support your body\'s natural healing processes. It is completely safe and works in harmony with all other treatments and medications.',
          price: 65,
          duration_minutes: 45,
          pricing_model: 'sliding_scale',
          is_remote: true,
          is_in_person: false,
          service_image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          requirements: 'Find a quiet, comfortable space where you can lie down and relax without interruption. Wear comfortable clothing and have water nearby to stay hydrated. It is helpful to set an intention for what you would like to heal or release.',
          what_to_expect: 'We will begin with a brief consultation about your current physical and emotional state. You will then lie down comfortably while I send Reiki energy to you. The session is conducted in peaceful silence with gentle background music. Afterward, we will discuss any sensations or insights you experienced.',
          is_active: true
        },
        practitioner: {
          id: '2',
          business_name: 'Sacred Healing Arts',
          bio: 'Licensed therapist and Reiki Master with over 15 years of experience in holistic healing. I specialize in trauma healing and spiritual recovery, combining traditional therapy with energy healing modalities to support deep transformation and healing.',
          specialties: ['Reiki Healing', 'Crystal Therapy', 'Meditation', 'Trauma Recovery'],
          years_of_experience: 15,
          location: 'Sedona, Arizona',
          profile_image_url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&fit=crop&crop=face',
          rating: 4.8,
          total_sessions: 320,
          total_reviews: 201,
          user: {
            id: '2',
            full_name: 'Dr. Keisha Johnson',
            email: 'keisha@sacredhealingarts.com'
          }
        }
      },
      '4': {
        service: {
          id: '4',
          title: 'Chakra Balancing Session',
          description: 'Align and balance your energy centers for optimal physical, emotional, and spiritual wellbeing. This comprehensive session works with all seven main chakras to restore harmony and vitality to your entire energy system.\n\nDuring this session, I will use a combination of energy healing techniques, crystal therapy, and guided visualization to identify and clear blockages in your chakra system. Each chakra governs different aspects of your physical, emotional, and spiritual well-being.\n\nThis healing modality is particularly effective for those feeling stuck, experiencing emotional imbalances, or seeking to enhance their spiritual connection.',
          price: 120,
          duration_minutes: 90,
          pricing_model: 'fixed',
          is_remote: false,
          is_in_person: true,
          service_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
          requirements: 'Please wear comfortable, loose-fitting clothing. Avoid heavy meals 2 hours before the session. Come with an open mind and willingness to release what no longer serves you.',
          what_to_expect: 'We will begin with a consultation about your current energy state and any specific concerns. You will lie comfortably while I work with each chakra using various healing techniques. The session concludes with integration time and guidance for maintaining chakra balance.',
          is_active: true
        },
        practitioner: {
          id: '4',
          business_name: 'Radiant Soul Coaching',
          bio: 'Relationship coach and energy healer specializing in helping women reclaim their power in love and life. Expert in boundary setting and authentic self-expression with 6 years of transformational experience.',
          specialties: ['Life Coaching', 'Relationship Guidance', 'Self-Love', 'Energy Healing'],
          years_of_experience: 6,
          location: 'Austin, Texas',
          profile_image_url: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&fit=crop&crop=face',
          rating: 4.9,
          total_sessions: 180,
          total_reviews: 98,
          user: {
            id: '4',
            full_name: 'Sophia Williams',
            email: 'sophia@radiantsoul.com'
          }
        }
      },
      '5': {
        service: {
          id: '5',
          title: 'Life Path Coaching',
          description: 'Navigate life transitions and discover your authentic path with experienced spiritual guidance. This coaching session is designed for those at crossroads, seeking clarity about their purpose, or ready to make significant life changes.\n\nI combine traditional coaching techniques with spiritual wisdom to help you uncover your true calling and develop a practical plan to align your life with your highest potential. We will explore your values, passions, and natural gifts.\n\nThis session is perfect for career transitions, relationship changes, or general life direction clarity.',
          price: 100,
          duration_minutes: 60,
          pricing_model: 'fixed',
          is_remote: true,
          is_in_person: true,
          service_image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop',
          requirements: 'Come prepared with any specific life questions or areas where you feel stuck. Bring a journal for note-taking and be ready for honest self-reflection.',
          what_to_expect: 'We will start by exploring your current situation and desired outcomes. Through guided questions and exercises, we will identify your core values and passions. The session concludes with a clear action plan and next steps.',
          is_active: true
        },
        practitioner: {
          id: '5',
          business_name: 'Inner Light Healing',
          bio: 'Shamanic practitioner and sound healer with training in indigenous healing traditions. Specializing in soul retrieval and spiritual cleansing with 12 years of dedicated practice.',
          specialties: ['Energy Healing', 'Shamanic Healing', 'Sound Therapy', 'Life Coaching'],
          years_of_experience: 12,
          location: 'Santa Fe, New Mexico',
          profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop&crop=face',
          rating: 4.7,
          total_sessions: 150,
          total_reviews: 89,
          user: {
            id: '5',
            full_name: 'Michael Thompson',
            email: 'michael@innerlight.com'
          }
        }
      },
      '6': {
        service: {
          id: '6',
          title: 'Guided Meditation Session',
          description: 'Find inner peace and clarity through personalized guided meditation practices. This session is perfect for beginners or those looking to deepen their meditation practice with professional guidance.\n\nI will guide you through various meditation techniques tailored to your specific needs and experience level. We will explore breathwork, visualization, and mindfulness practices that you can continue using in your daily life.\n\nThis healing session is ideal for stress relief, anxiety management, and developing a sustainable meditation practice.',
          price: 40,
          duration_minutes: 30,
          pricing_model: 'fixed',
          is_remote: true,
          is_in_person: false,
          service_image_url: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&h=600&fit=crop',
          requirements: 'Find a quiet space where you can sit or lie down comfortably without interruption. Have headphones ready for the best audio experience during remote sessions.',
          what_to_expect: 'We will begin with a brief discussion of your meditation experience and goals. I will then guide you through customized meditation techniques. The session ends with time for questions and guidance for home practice.',
          is_active: true
        },
        practitioner: {
          id: '6',
          business_name: 'Peaceful Mind Meditation',
          bio: 'Certified mindfulness instructor and meditation teacher. Helping busy professionals find inner peace and develop sustainable meditation practices with 5 years of dedicated teaching.',
          specialties: ['Guided Meditation', 'Mindfulness', 'Stress Relief', 'Breathwork'],
          years_of_experience: 5,
          location: 'San Diego, California',
          profile_image_url: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=400&fit=crop&crop=face',
          rating: 4.8,
          total_sessions: 280,
          total_reviews: 145,
          user: {
            id: '6',
            full_name: 'Anna Lopez',
            email: 'anna@peacefulmind.com'
          }
        }
      }
    }

    return mockServices[id as keyof typeof mockServices] || mockServices['1']
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
          <p className="text-gray-600 mb-4">The service you're looking for doesn't exist.</p>
          <Link href="/services" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Services
          </Link>
        </div>
      </div>
    )
  }

  const sessionType = service.is_remote && service.is_in_person 
    ? 'Remote & In-Person' 
    : service.is_remote 
    ? 'Remote Only' 
    : 'In-Person Only'

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
                <p className="text-sm text-purple-600">Service Details</p>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/services" className="text-purple-600 hover:text-purple-700">Services</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{service.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="h-64 bg-gradient-to-br from-purple-400 to-indigo-500 relative">
                <img
                  src={service.service_image_url}
                  alt={service.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
                  <div className="flex items-center space-x-4">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      ${service.price}
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      {service.duration_minutes} min
                    </span>
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      {sessionType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Service</h2>
              <div className="prose prose-purple max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {showFullDescription ? service.description : service.description.split('\n\n')[0]}
                </p>
                {service.description.split('\n\n').length > 1 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            </div>

            {/* What to Expect */}
            {service.what_to_expect && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Expect</h2>
                <p className="text-gray-700 leading-relaxed">{service.what_to_expect}</p>
              </div>
            )}

            {/* Requirements */}
            {service.requirements && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Preparation & Requirements</h2>
                <p className="text-gray-700 leading-relaxed">{service.requirements}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Booking Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  ${service.price}
                  {service.pricing_model === 'sliding_scale' && (
                    <span className="text-sm text-gray-500 font-normal"> (sliding scale)</span>
                  )}
                </div>
                <div className="text-gray-600">
                  {service.duration_minutes} minute session
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Session Type:</span>
                  <span className="font-medium">{sessionType}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{service.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Pricing:</span>
                  <span className="font-medium capitalize">{service.pricing_model.replace('_', ' ')}</span>
                </div>
              </div>

              <Link
                href={`/book/${service.id}`}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-center block mb-4"
              >
                Book This Session
              </Link>

              <Link
                href={`/messages/${practitioner?.id}`}
                className="w-full border border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-3 px-6 rounded-lg transition-colors text-center block"
              >
                Message Practitioner
              </Link>
            </div>

            {/* Practitioner Card */}
            {practitioner && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Practitioner</h3>
                
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={practitioner.profile_image_url}
                    alt={practitioner.user?.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{practitioner.business_name}</h4>
                    <p className="text-purple-600 text-sm">{practitioner.user?.full_name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="flex items-center text-yellow-500">
                        ⭐ {practitioner.rating}
                      </span>
                      <span>•</span>
                      <span>{practitioner.total_sessions} sessions</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{practitioner.years_of_experience} years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{practitioner.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reviews:</span>
                    <span className="font-medium">{practitioner.total_reviews} reviews</span>
                  </div>
                </div>

                {practitioner.specialties && practitioner.specialties.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-2">
                      {practitioner.specialties.map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {practitioner.bio}
                </p>

                <Link
                  href={`/profile/${practitioner.id}`}
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors text-center block"
                >
                  View Full Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}