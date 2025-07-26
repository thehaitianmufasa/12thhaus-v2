'use client'
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
            rating: userData.practitioner?.rating || 0,
            sessions: userData.practitioner?.total_sessions || 0,
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

  // Fallback mock user data
  const getMockUserData = (id: string) => {
    const users = {
      '1': {
        id: '1',
        name: 'Maya Rodriguez',
        userType: 'practitioner',
        businessName: 'Mystic Maya Spiritual Guidance',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
        bannerImage: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=800',
        bio: 'Former corporate executive turned intuitive spiritual guide with 10+ years of experience. Specializing in helping ambitious individuals navigate life transitions with confidence and clarity.',
        location: 'Boulder, Colorado',
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
      '2': {
        id: '2',
        name: 'Dr. Keisha Johnson',
        userType: 'practitioner',
        businessName: 'Sacred Healing Arts',
        profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
        bannerImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        bio: 'Licensed therapist and Reiki Master with over 15 years of experience in holistic healing. Specializing in trauma healing and spiritual recovery, combining traditional therapy with energy healing modalities.',
        location: 'Sedona, Arizona',
        joinDate: 'November 2024',
        isVerified: true,
        followers: 2156,
        following: 289,
        posts: 201,
        specialties: ['Reiki Healing', 'Crystal Therapy', 'Meditation', 'Trauma Recovery'],
        yearsExperience: 15,
        rating: 4.8,
        sessions: 320
      },
      '3': {
        id: '3',
        name: 'Sarah Chen',
        userType: 'practitioner',
        businessName: 'Cosmic Insights Astrology',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        bannerImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
        bio: 'Certified astrologer with expertise in psychological astrology and evolutionary approach. Helping clients understand their cosmic blueprint and life purpose through the wisdom of the stars.',
        location: 'Portland, Oregon',
        joinDate: 'October 2024',
        isVerified: true,
        followers: 1876,
        following: 234,
        posts: 178,
        specialties: ['Natal Charts', 'Transit Readings', 'Relationship Astrology'],
        yearsExperience: 8,
        rating: 5.0,
        sessions: 195
      },
      '4': {
        id: '4',
        name: 'Sophia Williams',
        userType: 'practitioner',
        businessName: 'Radiant Soul Coaching',
        profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400',
        bannerImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        bio: 'Relationship coach and energy healer specializing in helping women reclaim their power in love and life. Expert in boundary setting and authentic self-expression.',
        location: 'Austin, Texas',
        joinDate: 'September 2024',
        isVerified: true,
        followers: 1432,
        following: 367,
        posts: 134,
        specialties: ['Life Coaching', 'Relationship Guidance', 'Self-Love', 'Energy Healing'],
        yearsExperience: 6,
        rating: 4.9,
        sessions: 180
      },
      '5': {
        id: '5',
        name: 'Michael Thompson',
        userType: 'practitioner',
        businessName: 'Inner Light Healing',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        bannerImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
        bio: 'Shamanic practitioner and sound healer with training in indigenous healing traditions. Specializing in soul retrieval and spiritual cleansing with deep compassion.',
        location: 'Santa Fe, New Mexico',
        joinDate: 'August 2024',
        isVerified: true,
        followers: 987,
        following: 445,
        posts: 89,
        specialties: ['Energy Healing', 'Shamanic Healing', 'Sound Therapy', 'Life Coaching'],
        yearsExperience: 12,
        rating: 4.7,
        sessions: 150
      },
      '6': {
        id: '6',
        name: 'Anna Lopez',
        userType: 'practitioner',
        businessName: 'Peaceful Mind Meditation',
        profileImage: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=400',
        bannerImage: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800',
        bio: 'Certified mindfulness instructor and meditation teacher. Helping busy professionals find inner peace and develop sustainable meditation practices.',
        location: 'San Diego, California',
        joinDate: 'July 2024',
        isVerified: true,
        followers: 1765,
        following: 298,
        posts: 223,
        specialties: ['Guided Meditation', 'Mindfulness', 'Stress Relief', 'Breathwork'],
        yearsExperience: 5,
        rating: 4.8,
        sessions: 280
      },
      'user3': {
        id: 'user3',
        name: 'Jennifer Martinez',
        userType: 'seeker',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        bannerImage: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800',
        bio: 'On a beautiful journey of spiritual awakening and self-discovery. Love exploring different healing modalities and connecting with like-minded souls. Always learning, always growing. 🌟',
        location: 'Austin, Texas',
        joinDate: 'January 2025',
        isVerified: false,
        followers: 89,
        following: 156,
        posts: 23,
        interests: ['Chakra Healing', 'Meditation', 'Crystal Therapy'],
        spiritualLevel: 'Intermediate'
      }
    }
    const foundUser = users[id] || users['1']
    console.log('getMockUserData called with id:', id, 'found user:', foundUser)
    return foundUser
  }

  // User data now comes from GraphQL fetch

  const [userPosts] = useState([
    {
      id: 'post1',
      content: '✨ Just finished an incredible tarot reading session with a seeker who was struggling with career decisions. The cards revealed such beautiful guidance about trusting their intuition and taking that leap of faith. Sometimes the universe speaks through us in the most profound ways. 🔮\n\nRemember, dear souls - your inner wisdom knows the path. Trust it. 💜',
      image: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=600',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      saves: 12,
      hashtags: ['TarotWisdom', 'TrustYourIntuition', 'SpiritualGuidance']
    },
    {
      id: 'post2',
      content: 'Morning meditation practice complete! 🧘‍♀️ Today I\'m focusing on heart chakra healing and sending love to all the beautiful souls on their spiritual journey. \n\nIf you\'re reading this, you\'re exactly where you need to be. Trust the process. ✨',
      image: null,
      timestamp: '1 day ago',
      likes: 31,
      comments: 12,
      shares: 5,
      saves: 8,
      hashtags: ['MorningMeditation', 'HeartChakra', 'SpiritualJourney']
    },
    {
      id: 'post3',
      content: '🌟 Teaching moment: The sacral chakra (our creative and emotional center) often holds trauma and blocks that manifest as creative blocks or relationship difficulties.\n\nDuring energy healing, I often see clients light up when we work on releasing old patterns stored here. It\'s like watching someone remember their own magic. ✨',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
      timestamp: '3 days ago',
      likes: 45,
      comments: 15,
      shares: 12,
      saves: 23,
      hashtags: ['ChakraWisdom', 'EnergyHealing', 'SacralChakra']
    }
  ])

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

  // Define services after user is confirmed to exist
  const services = user.userType === 'practitioner' ? [
    {
      id: 1,
      title: 'Intuitive Tarot Reading',
      price: 75,
      duration: 60,
      rating: 4.9,
      bookings: 45,
      image: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=300'
    },
    {
      id: 2,
      title: 'Chakra Balancing Session',
      price: 120,
      duration: 90,
      rating: 4.8,
      bookings: 32,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300'
    }
  ] : []

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