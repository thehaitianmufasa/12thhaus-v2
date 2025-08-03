'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function UserProfile() {
  const params = useParams()
  const userId = params.id as string
  const [activeTab, setActiveTab] = useState('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real user data from GraphQL
  useEffect(() => {
    const fetchUser = async () => {
      console.log('Fetching user profile for ID:', userId)
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query($userId: String!) {
                user(id: $userId) {
                  id
                  email
                  full_name
                  user_type
                  profile_image_url
                  created_at
                  practitioner {
                    business_name
                    bio
                    specialties
                    years_of_experience
                    location_city
                    certifications
                    rating
                    total_sessions
                    total_reviews
                  }
                  seeker_preferences {
                    bio
                    spiritual_interests
                    experience_level
                    location
                  }
                }
              }
            `,
            variables: { userId }
          })
        })
        
        const data = await response.json()
        console.log('GraphQL response for user:', userId, data)
        if (data.data && data.data.user) {
          const userData = data.data.user
          console.log('Found GraphQL user data:', userData)
          // Transform to match existing component structure
          const transformedUser = {
            id: userData.id,
            name: userData.full_name,
            userType: userData.user_type,
            email: userData.email,
            profileImage: userData.profile_image_url || 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
            bannerImage: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=800',
            joinDate: new Date(userData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
            isVerified: userData.user_type === 'practitioner' && userData.practitioner?.business_name,
            followers: Math.floor(Math.random() * 2000) + 100,
            following: Math.floor(Math.random() * 500) + 50,
            posts: Math.floor(Math.random() * 200) + 20,
            // Practitioner specific
            businessName: userData.practitioner?.business_name,
            bio: userData.practitioner?.bio || userData.seeker_preferences?.bio || 'Spiritual journey in progress...',
            specialties: userData.practitioner?.specialties,
            yearsExperience: userData.practitioner?.years_of_experience,
            location: userData.practitioner?.location_city || userData.seeker_preferences?.location || 'Location not specified',
            rating: userData.practitioner?.rating || 4.8,
            sessions: userData.practitioner?.total_sessions || 320,
            // Seeker specific
            interests: userData.seeker_preferences?.spiritual_interests,
            spiritualLevel: userData.seeker_preferences?.experience_level
          }
          setUser(transformedUser)
        } else {
          console.log('No GraphQL user data found, falling back to mock data')
          const mockUser = getMockUserData(userId)
          console.log('Using mock data fallback:', mockUser)
          setUser(mockUser)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        // Fallback to mock data if GraphQL fails
        const mockUser = getMockUserData(userId)
        console.log('Using mock data for user:', userId, mockUser)
        setUser(mockUser)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  // Fallback mock user data - matches homepage practitioners with database user_ids
  const getMockUserData = (id: string) => {
    const users = {
      // Dr. Keisha Johnson - Sacred Healing Arts
      'aa86d565-b888-4fe9-ab69-8dd6a815def1': {
        id: 'aa86d565-b888-4fe9-ab69-8dd6a815def1',
        name: 'Dr. Keisha Johnson',
        userType: 'practitioner',
        businessName: 'Sacred Healing Arts',
        profileImage: 'https://t4.ftcdn.net/jpg/01/96/09/21/360_F_196092169_tqXVrlcZnpt0mDaNFqq5Ife4q01GYDXH.jpg',
        bannerImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', // Mindfulness/meditation setting
        bio: 'Licensed therapist and Reiki Master specializing in trauma healing and spiritual recovery.',
        location: 'Houston, Texas',
        joinDate: 'November 2024',
        isVerified: true,
        followers: 2156,
        following: 289,
        posts: 201,
        specialties: ['Reiki Healing', 'Crystal Therapy', 'Meditation', 'Trauma Healing'],
        yearsExperience: 15,
        rating: 4.8,
        sessions: 320
      },
      // Sarah Chen - Cosmic Insights Astrology  
      'ab5feb84-b8e5-4476-b61a-d2d5bbff87b8': {
        id: 'ab5feb84-b8e5-4476-b61a-d2d5bbff87b8',
        name: 'Sarah Chen',
        userType: 'practitioner',
        businessName: 'Cosmic Insights Astrology',
        profileImage: 'https://t3.ftcdn.net/jpg/04/17/85/08/360_F_417850826_ZQ98ggEKoZcqFjfLSgmBwYPHu1Tc4MGU.jpg',
        bannerImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', // Cosmic/astrology setting
        bio: 'Certified astrologer with expertise in psychological astrology.',
        location: 'San Francisco, California',
        joinDate: 'October 2024',
        isVerified: true,
        followers: 1543,
        following: 256,
        posts: 98,
        specialties: ['Natal Charts', 'Transit Readings', 'Relationship Astrology'],
        yearsExperience: 8,
        rating: 4.9,
        sessions: 185
      },
      // Maya Rodriguez - Mystic Maya Spiritual Guidance
      '2004c8aa-8779-4ec0-98ff-1f85099c94fe': {
        id: '2004c8aa-8779-4ec0-98ff-1f85099c94fe',
        name: 'Maya Rodriguez',
        userType: 'practitioner',
        businessName: 'Mystic Maya Spiritual Guidance',
        profileImage: 'https://t4.ftcdn.net/jpg/02/76/94/85/360_F_276948525_rdTb1EKACpjnnA5XyRKLQC2lBYPVi7vQ.jpg',
        bannerImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800', // Executive/business setting
        bio: 'Former corporate executive turned intuitive spiritual guide with 10+ years of experience.',
        location: 'Miami, Florida',
        joinDate: 'December 2024',
        isVerified: true,
        followers: 1247,
        following: 342,
        posts: 156,
        specialties: ['Tarot Reading', 'Energy Healing', 'Chakra Balancing'],
        yearsExperience: 10,
        rating: 4.9,
        sessions: 240
      },
      // Additional practitioners from seed data
      'af90a604-3f20-47c8-9b92-ae0f8bb049e3': {
        id: 'af90a604-3f20-47c8-9b92-ae0f8bb049e3',
        name: 'Sophia Williams',
        userType: 'practitioner',
        businessName: 'Radiant Soul Coaching',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
        bannerImage: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800',
        bio: 'After leaving a toxic relationship and rebuilding my entire life from scratch, I learned that true love starts with loving yourself first. I help women (and men!) break free from people-pleasing patterns, set healthy boundaries, and step into their authentic power in all relationships.',
        location: 'Austin, Texas',
        joinDate: 'September 2024',
        isVerified: true,
        followers: 1432,
        following: 367,
        posts: 134,
        specialties: ['Life Coaching', 'Relationship Guidance', 'Self-Love', 'Boundary Setting'],
        yearsExperience: 6,
        rating: 4.7,
        sessions: 156
      },
      'bf719579-5527-43fe-b499-e3e3e3a6ebc0': {
        id: 'bf719579-5527-43fe-b499-e3e3e3a6ebc0',
        name: 'Michael Thompson',
        userType: 'practitioner',
        businessName: 'Inner Light Healing',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        bannerImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
        bio: 'My shamanic training began after a near-death experience opened my perception to non-ordinary reality. I have spent years studying with indigenous healers and medicine carriers. I help people retrieve lost soul parts and reconnect with their spiritual power and purpose.',
        location: 'Santa Fe, New Mexico',
        joinDate: 'August 2024',
        isVerified: true,
        followers: 987,
        following: 445,
        posts: 89,
        specialties: ['Shamanic Healing', 'Sound Therapy', 'Soul Retrieval', 'Spiritual Cleansing'],
        yearsExperience: 12,
        rating: 4.8,
        sessions: 234
      },
      '095ee515-d3eb-429f-aab8-8a3909375647': {
        id: '095ee515-d3eb-429f-aab8-8a3909375647',
        name: 'Anna Lopez',
        userType: 'practitioner',
        businessName: 'Peaceful Mind Meditation',
        profileImage: 'https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?w=400&h=400&fit=crop&crop=face',
        bannerImage: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800',
        bio: 'Meditation literally saved my sanity during my high-stress corporate days. What started as a desperate attempt to manage anxiety became a profound spiritual practice. I love teaching busy people that you do not need hours of perfect silence - just a willingness to begin.',
        location: 'San Diego, California',
        joinDate: 'July 2024',
        isVerified: true,
        followers: 1765,
        following: 298,
        posts: 223,
        specialties: ['Guided Meditation', 'Mindfulness', 'Stress Relief', 'Corporate Wellness'],
        yearsExperience: 5,
        rating: 4.6,
        sessions: 178
      }
    }
    const foundUser = users[id] || users['aa86d565-b888-4fe9-ab69-8dd6a815def1']
    console.log('getMockUserData called with id:', id, 'found user:', foundUser)
    return foundUser
  }

  // User data now comes from GraphQL fetch

  // Dynamic posts based on practitioner specialty
  const getFieldSpecificPosts = (userId: string, specialties: string[]) => {
    const postTemplates = {
      // Dr. Keisha Johnson - Sacred Healing Arts (Reiki, Crystal Therapy, Meditation, Trauma Healing)
      'aa86d565-b888-4fe9-ab69-8dd6a815def1': [
        {
          id: 'post1',
          content: '✨ Just completed a beautiful Reiki session focused on trauma healing. Watching someone\'s energy shift from heavy to light is pure magic. \n\nTrauma lives in the body, but so does our capacity for healing. Through Reiki and crystal therapy, we create safe spaces for profound transformation. 💎',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
          timestamp: '3 hours ago',
          likes: 34,
          comments: 12,
          shares: 8,
          saves: 15,
          hashtags: ['Reiki', 'TraumaHealing', 'CrystalTherapy', 'EnergyHealing']
        },
        {
          id: 'post2',
          content: '🧘‍♀️ Meditation isn\'t about stopping thoughts - it\'s about changing your relationship with them. In today\'s guided session, we worked with rose quartz to heal heart chakra wounds.\n\nHealers heal themselves first. Self-care isn\'t selfish; it\'s essential medicine.',
          image: null,
          timestamp: '2 days ago',
          likes: 28,
          comments: 9,
          shares: 6,
          saves: 11,
          hashtags: ['Meditation', 'HeartChakra', 'SelfCare', 'RoseQuartz']
        },
        {
          id: 'post3',
          content: '💎 Crystal spotlight: Amethyst for trauma recovery. This powerful stone helps transmute pain into wisdom. I often pair it with Reiki for deep cellular healing.\n\nRemember: You\'re not broken. You\'re healing. And that takes incredible courage.',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
          timestamp: '4 days ago',
          likes: 41,
          comments: 18,
          shares: 12,
          saves: 22,
          hashtags: ['Amethyst', 'TraumaRecovery', 'CrystalHealing', 'Courage']
        }
      ],
      // Sarah Chen - Cosmic Insights Astrology (Natal Charts, Transit Readings, Relationship Astrology)
      'ab5feb84-b8e5-4476-b61a-d2d5bbff87b8': [
        {
          id: 'post1',
          content: '🌟 Mars is entering Aries this week - time for bold action! If you\'ve been hesitating on a major decision, the cosmic winds are at your back.\n\nYour natal chart holds the roadmap, but transit readings show you the perfect timing. Trust the stars - they\'re aligning for your success. ✨',
          image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600',
          timestamp: '1 hour ago',
          likes: 52,
          comments: 24,
          shares: 18,
          saves: 31,
          hashtags: ['MarsInAries', 'TransitReadings', 'CosmicTiming', 'Astrology']
        },
        {
          id: 'post2',
          content: '💫 Your natal chart is like a cosmic fingerprint - completely unique to you. Understanding your sun, moon, and rising signs is just the beginning.\n\nRelationship astrology reveals how you love, what you need, and where you might face challenges. Knowledge is power in love and life.',
          image: null,
          timestamp: '1 day ago',
          likes: 67,
          comments: 35,
          shares: 25,
          saves: 44,
          hashtags: ['NatalChart', 'RelationshipAstrology', 'SunMoonRising', 'CosmicFingerprint']
        },
        {
          id: 'post3',
          content: '🌙 New Moon in Pisces brings powerful intuitive downloads. This is perfect timing for meditation and connecting with your inner wisdom.\n\nPsychological astrology helps us understand not just what will happen, but why we react the way we do. Self-awareness is the first step to transformation.',
          image: 'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=600',
          timestamp: '3 days ago',
          likes: 39,
          comments: 16,
          shares: 11,
          saves: 27,
          hashtags: ['NewMoonPisces', 'PsychologicalAstrology', 'Intuition', 'SelfAwareness']
        }
      ],
      // Maya Rodriguez - Mystic Maya Spiritual Guidance (Tarot Reading, Energy Healing, Chakra Balancing)
      '2004c8aa-8779-4ec0-98ff-1f85099c94fe': [
        {
          id: 'post1',
          content: '🔮 Today\'s tarot pull: The Fool card reminds us that new beginnings require courage to step into the unknown. A client just made a life-changing decision after her reading.\n\nTarot doesn\'t predict your future - it reveals the energy currents around you. You always have the power to choose your path. ✨',
          image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600',
          timestamp: '2 hours ago',
          likes: 43,
          comments: 19,
          shares: 14,
          saves: 26,
          hashtags: ['TarotReading', 'TheFoolCard', 'NewBeginnings', 'TarotWisdom']
        },
        {
          id: 'post2',
          content: '💫 Chakra balancing session today focused on the heart chakra. When this energy center is blocked, we struggle with giving and receiving love - including self-love.\n\nAfter clearing old wounds, my client felt immediate relief. Energy work creates space for transformation to happen naturally.',
          image: null,
          timestamp: '2 days ago',
          likes: 56,
          comments: 28,
          shares: 19,
          saves: 38,
          hashtags: ['ChakraBalancing', 'HeartChakra', 'EnergyWork', 'SelfLove']
        },
        {
          id: 'post3',
          content: '🌟 From corporate boardroom to tarot table - my journey taught me that intuition is our most undervalued business asset. Now I help others trust their inner guidance.\n\nSuccess isn\'t just about strategy. It\'s about alignment with your soul\'s purpose. That\'s where the real magic happens.',
          image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600',
          timestamp: '4 days ago',
          likes: 61,
          comments: 32,
          shares: 21,
          saves: 45,
          hashtags: ['CorporateToSpiritual', 'TrustYourIntuition', 'SoulPurpose', 'InnerGuidance']
        }
      ],
      // Sophia Williams - Radiant Soul Coaching (Life Coaching, Relationship Guidance, Self-Love, Boundary Setting)
      'af90a604-3f20-47c8-9b92-ae0f8bb049e3': [
        {
          id: 'post1',
          content: '💕 Boundaries aren\'t walls - they\'re gates with you as the gatekeeper. Had a beautiful session today helping a client reclaim her power in relationships.\n\nSaying "no" to what doesn\'t serve you is saying "yes" to what does. Your energy is sacred - protect it fiercely. ✨',
          image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600',
          timestamp: '2 hours ago',
          likes: 43,
          comments: 19,
          shares: 14,
          saves: 26,
          hashtags: ['HealthyBoundaries', 'SelfLove', 'RelationshipHealing']
        },
        {
          id: 'post2',
          content: '🌟 Self-love isn\'t selfish - it\'s the foundation of healthy relationships. When we heal our own patterns of self-doubt and people-pleasing, we naturally attract more aligned connections.\n\nThe work starts within. You can\'t pour from an empty cup.',
          image: null,
          timestamp: '2 days ago',
          likes: 56,
          comments: 28,
          shares: 19,
          saves: 38,
          hashtags: ['SelfLoveFirst', 'HealthyRelationships', 'InnerWork']
        },
        {
          id: 'post3',
          content: '💫 Your relationship with yourself sets the tone for all other relationships. After rebuilding my life from a toxic situation, I learned that true love starts with loving yourself first.\n\nYou are whole, complete, and worthy of love - just as you are.',
          image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600',
          timestamp: '4 days ago',
          likes: 61,
          comments: 32,
          shares: 21,
          saves: 45,
          hashtags: ['SelfWorth', 'ToxicRelationshipRecovery', 'YouAreEnough']
        }
      ],
      // Michael Thompson - Inner Light Healing (Shamanic Healing, Sound Therapy, Soul Retrieval, Spiritual Cleansing)
      'bf719579-5527-43fe-b499-e3e3e3a6ebc0': [
        {
          id: 'post1',
          content: '🔥 Soul retrieval session today brought back such powerful medicine. When we experience trauma, parts of our soul can fragment and hide for protection.\n\nHealing isn\'t about fixing what\'s broken - it\'s about calling home the parts of ourselves that went into hiding. Welcome back, beautiful soul. 🙏',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
          timestamp: '3 hours ago',
          likes: 67,
          comments: 24,
          shares: 18,
          saves: 41,
          hashtags: ['SoulRetrieval', 'ShamanicHealing', 'TraumaHealing', 'SpiritualCleansing']
        },
        {
          id: 'post2',
          content: '🥁 The drum calls us back to our primal knowing. In indigenous traditions, sound healing was medicine - frequencies that could shift consciousness and clear stuck energy.\n\nModern science is finally catching up to what our ancestors always knew. Vibration heals.',
          image: null,
          timestamp: '1 day ago',
          likes: 34,
          comments: 15,
          shares: 9,
          saves: 22,
          hashtags: ['SoundHealing', 'IndigenousWisdom', 'VibrationMedicine', 'AncientKnowing']
        },
        {
          id: 'post3',
          content: '🌌 My near-death experience opened doorways I didn\'t know existed. The spirit world isn\'t "out there" - it\'s woven through everything, waiting for us to remember how to see.\n\nShamanic work helps us remember our connection to all life. We are not separate.',
          image: 'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=600',
          timestamp: '3 days ago',
          likes: 89,
          comments: 41,
          shares: 31,
          saves: 67,
          hashtags: ['ShamanicJourney', 'SpiritWorld', 'AllConnected', 'IndigenousTeachings']
        }
      ],
      // Anna Lopez - Peaceful Mind Meditation (Guided Meditation, Mindfulness, Stress Relief, Corporate Wellness)
      '095ee515-d3eb-429f-aab8-8a3909375647': [
        {
          id: 'post1',
          content: '🧘‍♀️ You don\'t need to sit in lotus position for hours to meditate. You don\'t need perfect silence or an empty mind.\n\nYou just need willingness to begin. Three conscious breaths before a meeting. Mindful steps to the coffee shop. Meditation is life lived with awareness. ☕',
          image: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=600',
          timestamp: '1 hour ago',
          likes: 78,
          comments: 35,
          shares: 24,
          saves: 52,
          hashtags: ['MindfulMoments', 'MeditationMyths', 'StressRelief', 'Mindfulness']
        },
        {
          id: 'post2',
          content: '💼 Corporate wellness sessions this week reminded me why I love this work. Watching stressed executives discover they can find peace in 5 minutes is pure magic.\n\nMeditation isn\'t luxury - it\'s essential healthcare for busy minds. Your nervous system will thank you.',
          image: null,
          timestamp: '2 days ago',
          likes: 45,
          comments: 18,
          shares: 12,
          saves: 29,
          hashtags: ['CorporateWellness', 'StressManagement', 'ExecutiveHealth', 'MindfulBusiness']
        },
        {
          id: 'post3',
          content: '🌱 Meditation saved my sanity during my high-stress corporate days. What started as desperation became devotion. Now I teach others that peace isn\'t found - it\'s remembered.\n\nYou already have everything you need. Just breathe.',
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600',
          timestamp: '5 days ago',
          likes: 92,
          comments: 47,
          shares: 33,
          saves: 71,
          hashtags: ['MeditationJourney', 'CorporateRecovery', 'InnerPeace', 'Breathwork']
        }
      ]
    }
    
    return postTemplates[userId] || postTemplates['aa86d565-b888-4fe9-ab69-8dd6a815def1']
  }

  const [userPosts] = useState(getFieldSpecificPosts(userId, user?.specialties || []))

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 text-lg">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('User not found - userId:', userId, 'user state:', user, 'loading:', loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist.</p>
          <Link href="/community/feed" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Community
          </Link>
        </div>
      </div>
    )
  }

  // Define field-specific services after user is confirmed to exist
  const getFieldSpecificServices = (userId: string) => {
    const serviceTemplates = {
      // Dr. Keisha Johnson - Sacred Healing Arts
      'aa86d565-b888-4fe9-ab69-8dd6a815def1': [
        {
          id: 1,
          title: 'Executive Career Clarity Session',
          price: 150,
          duration: 90,
          rating: 4.9,
          bookings: 67,
          image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300'
        },
        {
          id: 2,
          title: 'Life Transition Coaching',
          price: 125,
          duration: 60,
          rating: 4.8,
          bookings: 54,
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
        },
        {
          id: 3,
          title: 'Intuitive Business Strategy',
          price: 200,
          duration: 120,
          rating: 5.0,
          bookings: 32,
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'
        }
      ],
      '2': [ // Dr. Keisha Johnson - Mindfulness/Therapy
        {
          id: 1,
          title: 'Mindfulness-Based Therapy',
          price: 140,
          duration: 50,
          rating: 4.9,
          bookings: 89,
          image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300'
        },
        {
          id: 2,
          title: 'Burnout Recovery Program',
          price: 180,
          duration: 90,
          rating: 4.8,
          bookings: 76,
          image: 'https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=300'
        },
        {
          id: 3,
          title: 'Stress Management Workshop',
          price: 85,
          duration: 60,
          rating: 4.7,
          bookings: 123,
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300'
        }
      ],
      '3': [ // Sophia Williams - Relationship/Energy Healing
        {
          id: 1,
          title: 'Relationship Empowerment Session',
          price: 130,
          duration: 75,
          rating: 5.0,
          bookings: 58,
          image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=300'
        },
        {
          id: 2,
          title: 'Boundary Setting Workshop',
          price: 95,
          duration: 60,
          rating: 4.9,
          bookings: 71,
          image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300'
        },
        {
          id: 3,
          title: 'Energy Healing & Self-Love',
          price: 160,
          duration: 90,
          rating: 4.8,
          bookings: 45,
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300'
        }
      ]
    }
    
    return serviceTemplates[userId] || serviceTemplates['1']
  }

  const services = user.userType === 'practitioner' ? getFieldSpecificServices(userId) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/community/feed" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-sm text-purple-600">← Back to Community</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/community/feed" className="text-gray-700 hover:text-purple-600 transition-colors">
                Community
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Banner */}
          <div 
            className="h-48 bg-gradient-to-r from-purple-400 to-indigo-500 relative"
            style={{
              backgroundImage: `url(${user.bannerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Info */}
          <div className="px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                {/* Profile Image */}
                <div className="relative -mt-16">
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                  />
                  {user.isVerified && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="pt-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    {user.userType === 'practitioner' && user.businessName ? user.businessName : user.name}
                  </h2>
                  {user.userType === 'practitioner' && user.businessName && (
                    <p className="text-lg text-purple-600 mb-2">{user.name}</p>
                  )}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.userType === 'practitioner'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {user.userType}
                    </span>
                    {user.userType === 'practitioner' && (
                      <span className="text-sm text-gray-600">
                        {user.yearsExperience} years experience • ⭐ {user.rating} ({user.sessions} sessions)
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">📍 {user.location}</p>
                  <p className="text-gray-500 text-sm">Joined {user.joinDate}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-8 flex space-x-3">
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <Link href={`/messages/${user.id}`} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Message
                </Link>
                {user.userType === 'practitioner' && (
                  <Link href={`/book/${user.id}`} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Book Session
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>

            {/* Specialties/Interests */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {(user.specialties || user.interests || []).map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-600 text-sm rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 flex items-center space-x-8 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{user.posts}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{user.followers}</p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{user.following}</p>
                <p className="text-sm text-gray-600">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'posts', name: 'Posts', icon: '📝' },
                { id: 'about', name: 'About', icon: 'ℹ️' },
                ...(user.userType === 'practitioner' ? [{ id: 'services', name: 'Services', icon: '🔮' }] : [])
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
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {userPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {user.userType === 'practitioner' && user.businessName ? 
                            user.businessName : user.name}
                        </h4>
                        {user.isVerified && (
                          <span className="text-green-500 text-sm">✓</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.userType === 'practitioner'
                            ? 'bg-purple-100 text-purple-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {user.userType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-6 pb-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>
                  
                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.hashtags.map((tag, index) => (
                        <button 
                          key={index} 
                          onClick={() => {
                            // Future: implement hashtag filtering
                            console.log(`Searching for hashtag: #${tag}`)
                          }}
                          className="text-purple-600 text-sm font-medium hover:text-purple-700 hover:underline transition-colors cursor-pointer"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Image */}
                {post.image && (
                  <div className="px-6 pb-4">
                    <img
                      src={post.image}
                      alt="Post content"
                      className="w-full rounded-lg object-cover max-h-96"
                    />
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="px-6 py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>{post.shares} shares</span>
                      <span>{post.saves} saves</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-3 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                      <span>🤍</span>
                      <span className="font-medium">Like</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                      <span>💬</span>
                      <span className="font-medium">Comment</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                      <span>📤</span>
                      <span className="font-medium">Share</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors ml-auto">
                      <span>🔗</span>
                      <span className="font-medium">Save</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">About {user.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{user.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium">{user.joinDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Type:</span>
                    <span className="font-medium capitalize">{user.userType}</span>
                  </div>
                  {user.userType === 'practitioner' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{user.yearsExperience} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">⭐ {user.rating} ({user.sessions} sessions)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {user.userType === 'practitioner' ? 'Specialties' : 'Interests'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(user.specialties || user.interests || []).map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-purple-100 text-purple-600 text-sm rounded-lg font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Bio</h4>
              <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </div>
          </div>
        )}

        {activeTab === 'services' && user.userType === 'practitioner' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h4>
                  
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
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium text-yellow-600">⭐ {service.rating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bookings:</span>
                      <span className="font-medium">{service.bookings}</span>
                    </div>
                  </div>

                  <Link href={`/book/${service.id}`} className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-center">
                    Book Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}