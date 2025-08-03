'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

function CommunityFeedContent() {
  const [newPost, setNewPost] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({})
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Mock current user - will be replaced with real authentication
  const currentUser = {
    id: 'user1',
    name: 'Sarah Johnson',
    userType: 'seeker',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
    isVerified: false
  }

  // Fetch real posts and users from GraphQL
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                community_posts(limit: 20) {
                  id
                  author_id
                  title
                  content
                  post_type
                  spiritual_category
                  energy_level
                  media_urls
                  visibility
                  is_anonymous
                  allows_comments
                  comment_count
                  like_count
                  share_count
                  is_featured
                  created_at
                  updated_at
                  author {
                    id
                    email
                    full_name
                    user_type
                    profile_image_url
                    practitioner {
                      business_name
                      bio
                      specialties
                      years_of_experience
                    }
                    seeker_preferences {
                      bio
                      spiritual_interests
                      experience_level
                    }
                  }
                }
                users(limit: 20) {
                  id
                  email
                  full_name
                  user_type
                  profile_image_url
                  practitioner {
                    business_name
                    bio
                    specialties
                    years_of_experience
                  }
                  seeker_preferences {
                    bio
                    spiritual_interests
                    experience_level
                  }
                }
              }
            `
          })
        })
        
        const data = await response.json()
        if (data.data) {
          if (data.data.users) {
            setUsers(data.data.users)
          }
          if (data.data.community_posts) {
            // Transform GraphQL posts to match current frontend structure
            const transformedPosts = data.data.community_posts.map((post: any) => ({
              id: post.id,
              author: {
                id: post.author.id,
                name: post.author.full_name,
                userType: post.author.user_type,
                profileImage: post.author.profile_image_url || 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
                businessName: post.author.practitioner?.business_name,
                isVerified: post.author.user_type === 'practitioner'
              },
              content: post.content,
              title: post.title,
              image: post.media_urls && post.media_urls.length > 0 ? post.media_urls[0] : null,
              timestamp: new Date(post.created_at).toLocaleDateString(),
              likes: post.like_count || 0,
              comments: post.comment_count || 0,
              shares: post.share_count || 0,
              saves: 0, // Will be populated from user engagement data
              hashtags: extractHashtags(post.content),
              isLiked: false, // Will be populated from user engagement data
              isSaved: false, // Will be populated from user engagement data
              category: post.spiritual_category,
              energyLevel: post.energy_level,
              isAnonymous: post.is_anonymous,
              allowsComments: post.allows_comments
            }))
            setPosts(transformedPosts)
          }
        }
      } catch (error) {
        console.error('Error fetching community data:', error)
        // Fallback to generated posts if GraphQL fails
        if (users.length > 0) {
          const generatedPosts = generatePostsFromUsers(users)
          setPosts(generatedPosts)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCommunityData()
  }, [])

  // Helper function to extract hashtags from content
  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#[\w]+/g
    const matches = content.match(hashtagRegex)
    return matches ? matches.map(tag => tag.substring(1)) : []
  }

  // Generate posts from real user data
  const generatePostsFromUsers = (users: any[]) => {
    const samplePosts = [
      {
        content: '✨ Just finished an incredible tarot reading session with a seeker who was struggling with career decisions. The cards revealed such beautiful guidance about trusting their intuition and taking that leap of faith. Sometimes the universe speaks through us in the most profound ways. 🔮\n\nRemember, dear souls - your inner wisdom knows the path. Trust it. 💜',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
        hashtags: ['TarotWisdom', 'TrustYourIntuition', 'SpiritualGuidance'],
        userType: 'practitioner'
      },
      {
        content: 'Had my first chakra balancing session today and WOW! 🌈 I can actually feel the energy flowing differently through my body. The experience was transformative and I feel so much more aligned.\n\nFor anyone considering energy work, I highly recommend taking that step. The shift in my anxiety levels is already noticeable. Grateful for this spiritual community! 🙏',
        image: null,
        hashtags: ['ChakraHealing', 'EnergyWork', 'SpiritualJourney', 'Grateful'],
        userType: 'seeker'
      },
      {
        content: '🌟 Teaching moment: The sacral chakra (our creative and emotional center) often holds trauma and blocks that manifest as creative blocks or relationship difficulties.\n\nDuring energy healing, I often see clients light up when we work on releasing old patterns stored here. It\'s like watching someone remember their own magic. ✨',
        image: 'https://images.unsplash.com/photo-1574607162133-82e4b92ab8a4?w=600&h=400&fit=crop',
        hashtags: ['ChakraWisdom', 'EnergyHealing', 'SacralChakra', 'SpiritualTeaching'],
        userType: 'practitioner'
      },
      {
        content: 'Morning meditation complete! 🧘‍♂️ Today I\'m focusing on gratitude for this incredible spiritual community we\'re building together.\n\nIt\'s amazing how 12thhaus has connected me with practitioners who truly understand the journey. We\'re all walking each other home. 🏠✨\n\nWhat are you grateful for today?',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        hashtags: ['MorningMeditation', 'Gratitude', 'SpiritualCommunity', '12thhaus', 'Blessed'],
        userType: 'seeker'
      },
      {
        content: 'Spent the afternoon working with crystals and setting intentions for the new moon. There\'s something so powerful about connecting with the earth\'s energy through these beautiful stones. 💎\n\nEach crystal has its own unique vibration and healing properties. Today I worked with amethyst for spiritual clarity and rose quartz for self-love.',
        image: 'https://images.unsplash.com/photo-1610056494085-05e9fb6673ee?w=600&h=400&fit=crop',
        hashtags: ['CrystalHealing', 'NewMoon', 'SelfLove', 'Intentions'],
        userType: 'seeker'
      }
    ]

    return users.slice(0, 8).map((user, index) => {
      const postTemplate = samplePosts[index % samplePosts.length]
      const matchingPosts = samplePosts.filter(p => p.userType === user.user_type)
      const selectedPost = matchingPosts[Math.floor(Math.random() * matchingPosts.length)] || postTemplate

      return {
        id: `post${user.id}`,
        author: {
          id: user.id,
          name: user.full_name,
          userType: user.user_type,
          businessName: user.practitioner?.business_name || null,
          profileImage: user.profile_image_url || 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=100',
          isVerified: user.user_type === 'practitioner' && user.practitioner?.business_name
        },
        content: selectedPost.content,
        image: selectedPost.image,
        timestamp: `${Math.floor(Math.random() * 12) + 1} hours ago`,
        likes: Math.floor(Math.random() * 80) + 10,
        comments: Math.floor(Math.random() * 30) + 3,
        shares: Math.floor(Math.random() * 15) + 1,
        saves: Math.floor(Math.random() * 25) + 2,
        isLiked: Math.random() > 0.7,
        isSaved: Math.random() > 0.8,
        hashtags: selectedPost.hashtags
      }
    })
  }

  const [posts, setPosts] = useState<any[]>([])

  // Generate posts when users are loaded
  useEffect(() => {
    if (users.length > 0) {
      const generatedPosts = generatePostsFromUsers(users)
      setPosts(generatedPosts)
    }
  }, [users])

  const [comments] = useState({
    post1: [
      {
        id: 'comment1',
        author: { name: 'Emily R.', profileImage: 'https://images.unsplash.com/photo-1554727242-741c14fa561c?w=50' },
        content: 'This is so beautiful! Your readings always give me chills. Thank you for sharing your gift. 💜',
        timestamp: '1 hour ago',
        likes: 5
      },
      {
        id: 'comment2',
        author: { name: 'David L.', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50' },
        content: 'Maya, your insights are always spot on. Can\'t wait for my session next week!',
        timestamp: '30 minutes ago',
        likes: 3
      }
    ],
    post2: [
      {
        id: 'comment3',
        author: { name: 'Dr. Keisha Johnson', profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=50' },
        content: 'So wonderful to hear about your experience! Your energy was beautiful to work with. Keep nurturing that inner light! ✨',
        timestamp: '3 hours ago',
        likes: 8
      }
    ],
    post4: [
      {
        id: 'comment4',
        author: { name: 'Sarah J.', profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=50' },
        content: 'Grateful for practitioners like you who share their wisdom so openly! This community is truly special. 🙏',
        timestamp: '7 hours ago',
        likes: 12
      }
    ]
  })

  const filterOptions = [
    { id: 'all', name: 'All Posts', icon: '🌟' },
    { id: 'practitioners', name: 'Practitioners', icon: '✨' },
    { id: 'seekers', name: 'Seekers', icon: '🔮' },
    { id: 'following', name: 'Following', icon: '💜' },
    { id: 'saved', name: 'Saved', icon: '🔖' }
  ]

  const handleCreatePost = async () => {
    if (newPost.trim()) {
      try {
        // Create post via GraphQL mutation
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              mutation CreateCommunityPost($input: CommunityPostInput!) {
                create_community_post(input: $input) {
                  id
                  author_id
                  content
                  post_type
                  spiritual_category
                  created_at
                  author {
                    id
                    full_name
                    user_type
                    profile_image_url
                    practitioner {
                      business_name
                    }
                  }
                }
              }
            `,
            variables: {
              input: {
                author_id: currentUser.id,
                content: newPost,
                post_type: 'text',
                spiritual_category: 'general',
                visibility: 'public',
                allows_comments: true
              }
            }
          })
        })

        const data = await response.json()
        if (data.data && data.data.create_community_post) {
          const newPostData = data.data.create_community_post
          const post = {
            id: newPostData.id,
            author: {
              id: newPostData.author.id,
              name: newPostData.author.full_name,
              userType: newPostData.author.user_type,
              profileImage: newPostData.author.profile_image_url || currentUser.profileImage,
              businessName: newPostData.author.practitioner?.business_name,
              isVerified: newPostData.author.user_type === 'practitioner'
            },
            content: newPostData.content,
            image: null,
            timestamp: 'just now',
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            isLiked: false,
            isSaved: false,
            hashtags: extractHashtags(newPostData.content)
          }
          setPosts([post, ...posts])
          setNewPost('')
        }
      } catch (error) {
        console.error('Error creating post:', error)
        alert('Error creating post. Please try again.')
      }
    }
  }

  const handleLike = async (postId: string) => {
    try {
      // Optimistically update UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        }
        return post
      }))

      // Send GraphQL mutation
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation TogglePostEngagement($postId: String!, $engagementType: String!) {
              toggle_post_engagement(post_id: $postId, engagement_type: $engagementType) {
                id
                engagement_type
              }
            }
          `,
          variables: {
            postId,
            engagementType: 'like'
          }
        })
      })

      const data = await response.json()
      if (data.errors) {
        console.error('GraphQL error:', data.errors)
        // Revert optimistic update if there was an error
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes + 1 : post.likes - 1
            }
          }
          return post
        }))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert optimistic update
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes + 1 : post.likes - 1
          }
        }
        return post
      }))
    }
  }

  const handleSave = async (postId: string) => {
    try {
      // Optimistically update UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isSaved: !post.isSaved,
            saves: post.isSaved ? post.saves - 1 : post.saves + 1
          }
        }
        return post
      }))

      // Send GraphQL mutation
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation TogglePostEngagement($postId: String!, $engagementType: String!) {
              toggle_post_engagement(post_id: $postId, engagement_type: $engagementType) {
                id
                engagement_type
              }
            }
          `,
          variables: {
            postId,
            engagementType: 'save'
          }
        })
      })

      const data = await response.json()
      if (data.errors) {
        console.error('GraphQL error:', data.errors)
        // Revert optimistic update if there was an error
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isSaved: !post.isSaved,
              saves: post.isSaved ? post.saves + 1 : post.saves - 1
            }
          }
          return post
        }))
      }
    } catch (error) {
      console.error('Error toggling save:', error)
      // Revert optimistic update
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isSaved: !post.isSaved,
            saves: post.isSaved ? post.saves + 1 : post.saves - 1
          }
        }
        return post
      }))
    }
  }

  const handleShare = async (postId: string) => {
    try {
      // Optimistically update UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, shares: post.shares + 1 }
        }
        return post
      }))

      // Send GraphQL mutation
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation TogglePostEngagement($postId: String!, $engagementType: String!) {
              toggle_post_engagement(post_id: $postId, engagement_type: $engagementType) {
                id
                engagement_type
              }
            }
          `,
          variables: {
            postId,
            engagementType: 'share'
          }
        })
      })

      const data = await response.json()
      if (data.errors) {
        console.error('GraphQL error:', data.errors)
        // Revert optimistic update if there was an error
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { ...post, shares: post.shares - 1 }
          }
          return post
        }))
      } else {
        alert('Post shared! (Feature will be enhanced with actual sharing options)')
      }
    } catch (error) {
      console.error('Error sharing post:', error)
      // Revert optimistic update
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, shares: post.shares - 1 }
        }
        return post
      }))
    }
  }

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const filteredPosts = posts.filter(post => {
    switch (selectedFilter) {
      case 'practitioners':
        return post.author.userType === 'practitioner'
      case 'seekers':
        return post.author.userType === 'seeker'
      case 'saved':
        return post.isSaved
      case 'following':
        return post.author.id !== currentUser.id // Mock following logic
      default:
        return true
    }
  })

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
                <p className="text-sm text-purple-600">Spiritual Community</p>
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
              <Link href="/community/feed" className="text-purple-600 font-medium">
                Community
              </Link>
              <Link href="/messages" className="text-gray-700 hover:text-purple-600 transition-colors">
                Messages
              </Link>
              <Link href={`/dashboard/${currentUser.userType}`} className="text-gray-700 hover:text-purple-600 transition-colors">
                Dashboard
              </Link>
              <Link href={`/dashboard/${currentUser.userType}/profile`} className="flex items-center space-x-2">
                <img
                  src={currentUser.profileImage}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full border-2 border-purple-200"
                />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
                  selectedFilter === filter.id
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-purple-100'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-start space-x-4">
            <img
              src={currentUser.profileImage}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your spiritual journey, insights, or questions with the community..."
                rows={3}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                    <span>📷</span>
                    <span className="text-sm">Photo</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                    <span>😊</span>
                    <span className="text-sm">Mood</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors">
                    <span>#</span>
                    <span className="text-sm">Tags</span>
                  </button>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.trim()}
                  className="bg-purple-600 text-white px-8 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading community posts...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No posts found. Be the first to share something!</p>
            </div>
          ) : filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start space-x-4">
                  <Link href={`/profile/${post.author.id}`}>
                    <img
                      src={post.author.profileImage}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full hover:ring-2 hover:ring-purple-300 transition-all"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Link href={`/profile/${post.author.id}`} className="hover:text-purple-600 transition-colors">
                        <h4 className="font-semibold text-gray-900">
                          {post.author.userType === 'practitioner' && post.author.businessName ? 
                            post.author.businessName : post.author.name}
                        </h4>
                      </Link>
                      {post.author.isVerified && (
                        <span className="text-green-500 text-sm">✓</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        post.author.userType === 'practitioner'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {post.author.userType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
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
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:underline transition-colors cursor-pointer"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        post.isLiked
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className={post.isLiked ? '❤️' : '🤍'}>
                        {post.isLiked ? '❤️' : '🤍'}
                      </span>
                      <span className="font-medium">Like</span>
                    </button>
                    
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <span>💬</span>
                      <span className="font-medium">Comment</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <span>📤</span>
                      <span className="font-medium">Share</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleSave(post.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      post.isSaved
                        ? 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{post.isSaved ? '🔖' : '🔗'}</span>
                    <span className="font-medium">Save</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  {/* Comment Input */}
                  <div className="flex items-start space-x-3 mb-4">
                    <img
                      src={currentUser.profileImage}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Existing Comments */}
                  <div className="space-y-3">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <img
                          src={comment.author.profileImage}
                          alt={comment.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="bg-white rounded-lg px-3 py-2">
                            <h5 className="font-medium text-sm text-gray-900">{comment.author.name}</h5>
                            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span>{comment.timestamp}</span>
                            <button className="hover:text-purple-600">Like ({comment.likes})</button>
                            <button className="hover:text-purple-600">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="bg-white text-purple-600 px-8 py-3 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors font-medium">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CommunityFeed() {
  return (
    <ProtectedRoute>
      <CommunityFeedContent />
    </ProtectedRoute>
  )
}