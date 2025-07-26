'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'

function MessagesPageContent() {
  const params = useParams()
  const userId = params.userId as string
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [otherUser, setOtherUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock current user - will be replaced with real authentication
  const currentUser = {
    id: 'user1',
    name: 'Sarah Johnson',
    userType: 'seeker',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400'
  }

  // Fetch the other user's data
  useEffect(() => {
    const fetchUser = async () => {
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
                  practitioner {
                    business_name
                    bio
                    specialties
                  }
                  seeker_preferences {
                    bio
                  }
                }
              }
            `,
            variables: { userId }
          })
        })
        
        const data = await response.json()
        if (data.data && data.data.user) {
          const userData = data.data.user
          setOtherUser({
            id: userData.id,
            name: userData.full_name,
            userType: userData.user_type,
            businessName: userData.practitioner?.business_name,
            profileImage: userData.profile_image_url || 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400',
            bio: userData.practitioner?.bio || userData.seeker_preferences?.bio
          })
        } else {
          // Fallback to mock data
          setOtherUser({
            id: userId,
            name: 'Sarah Chen',
            userType: 'practitioner',
            businessName: 'Cosmic Insights Astrology',
            profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
            bio: 'Certified astrologer with expertise in psychological astrology.'
          })
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        // Fallback to mock data
        setOtherUser({
          id: userId,
          name: 'Sarah Chen',
          userType: 'practitioner',
          businessName: 'Cosmic Insights Astrology',
          profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
          bio: 'Certified astrologer with expertise in psychological astrology.'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  // Mock conversation data - in real app, this would come from GraphQL
  useEffect(() => {
    if (otherUser) {
      const mockMessages = [
        {
          id: 1,
          senderId: userId,
          senderName: otherUser.name,
          content: "Hi! Thank you for your interest in my astrology services. I'd love to help you explore your cosmic blueprint. What specific areas of your life are you hoping to gain insights about?",
          timestamp: '2 hours ago',
          isCurrentUser: false,
          senderImage: otherUser.profileImage
        },
        {
          id: 2,
          senderId: currentUser.id,
          senderName: currentUser.name,
          content: "Hello! I'm particularly interested in understanding my career path and relationships. I've been feeling quite lost lately and hoping astrology can provide some clarity.",
          timestamp: '1 hour ago',
          isCurrentUser: true,
          senderImage: currentUser.profileImage
        },
        {
          id: 3,
          senderId: userId,
          senderName: otherUser.name,
          content: "Absolutely, career and relationships are two of the most common areas people seek guidance on, and your birth chart can offer incredible insights into both! I'd be happy to do a comprehensive natal chart reading for you. \n\nWould you prefer a 60-minute session focusing on both areas, or would you like to book separate sessions to dive deeper into each topic?",
          timestamp: '45 minutes ago',
          isCurrentUser: false,
          senderImage: otherUser.profileImage
        },
        {
          id: 4,
          senderId: currentUser.id,
          senderName: currentUser.name,
          content: "I think a comprehensive 90-minute session covering both would be perfect! When do you have availability? And what information do you need from me to prepare the chart?",
          timestamp: '30 minutes ago',
          isCurrentUser: true,
          senderImage: currentUser.profileImage
        }
      ]
      setMessages(mockMessages)
    }
  }, [otherUser])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: newMessage,
        timestamp: 'just now',
        isCurrentUser: true,
        senderImage: currentUser.profileImage
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 text-lg">Loading conversation...</span>
        </div>
      </div>
    )
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-4">The conversation you're looking for doesn't exist.</p>
          <Link href="/community/feed" className="text-purple-600 hover:text-purple-700 font-medium">
            ← Back to Community
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
            <Link href={`/profile/${userId}`} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-sm text-purple-600">← Back to Profile</p>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Conversation Header */}
        <div className="bg-white rounded-t-2xl p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Link href={`/profile/${userId}`}>
              <img
                src={otherUser.profileImage}
                alt={otherUser.name}
                className="w-16 h-16 rounded-full hover:ring-2 hover:ring-purple-300 transition-all"
              />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {otherUser.userType === 'practitioner' && otherUser.businessName ? 
                  otherUser.businessName : otherUser.name}
              </h2>
              {otherUser.userType === 'practitioner' && otherUser.businessName && (
                <p className="text-purple-600">{otherUser.name}</p>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  otherUser.userType === 'practitioner'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {otherUser.userType}
                </span>
                <span className="text-sm text-green-600">● Online</span>
              </div>
            </div>
            <div className="ml-auto flex space-x-3">
              <Link 
                href={`/profile/${userId}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Profile
              </Link>
              {otherUser.userType === 'practitioner' && (
                <Link 
                  href={`/book/1`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Book Session
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="bg-white h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-3 ${message.isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <img
                src={message.senderImage}
                alt={message.senderName}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className={`max-w-xs lg:max-w-md ${message.isCurrentUser ? 'text-right' : ''}`}>
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.isCurrentUser
                      ? 'bg-purple-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1 px-2">{message.timestamp}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="bg-white rounded-b-2xl p-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <img
              src={currentUser.profileImage}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${otherUser.userType === 'practitioner' && otherUser.businessName ? otherUser.businessName : otherUser.name}...`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Send
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-4 mt-4 text-sm">
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors"
            >
              <span>📷</span>
              <span>Photo</span>
            </button>
            <button
              type="button"
              className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 transition-colors"
            >
              <span>📎</span>
              <span>Attach</span>
            </button>
            {otherUser.userType === 'practitioner' && (
              <Link
                href={`/book/1`}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors font-medium"
              >
                <span>📅</span>
                <span>Book Session</span>
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesPageContent />
    </ProtectedRoute>
  )
}