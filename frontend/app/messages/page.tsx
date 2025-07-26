'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

function MessagesInboxContent() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock current user - will be replaced with real authentication
  const currentUser = {
    id: 'user1',
    name: 'Sarah Johnson',
    userType: 'seeker',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616c381b2e6?w=400'
  }

  // Mock conversations data - in real app, this would come from GraphQL
  useEffect(() => {
    const mockConversations = [
      {
        id: 1,
        otherUser: {
          id: 'user2',
          name: 'Maya Rodriguez',
          businessName: 'Mystic Maya Spiritual Guidance',
          userType: 'practitioner',
          profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
          isOnline: true
        },
        lastMessage: {
          content: "Thank you for booking the session! I'm looking forward to our tarot reading tomorrow at 2 PM.",
          timestamp: '2 hours ago',
          isFromCurrentUser: false,
          isRead: true
        },
        unreadCount: 0
      },
      {
        id: 2,
        otherUser: {
          id: 'user3',
          name: 'Sarah Chen',
          businessName: 'Cosmic Insights Astrology',
          userType: 'practitioner',
          profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
          isOnline: false
        },
        lastMessage: {
          content: "I think a comprehensive 90-minute session covering both would be perfect! When do you have availability?",
          timestamp: '30 minutes ago',
          isFromCurrentUser: true,
          isRead: false
        },
        unreadCount: 1
      },
      {
        id: 3,
        otherUser: {
          id: 'user4',
          name: 'Dr. Keisha Johnson',
          businessName: 'Sacred Healing Arts',
          userType: 'practitioner',
          profileImage: 'https://images.unsplash.com/photo-1594824980346-375852386693?w=400&h=400&fit=crop&crop=face',
          isOnline: true
        },
        lastMessage: {
          content: "The Reiki session was transformative! Thank you so much. I already feel more balanced and centered.",
          timestamp: '1 day ago',
          isFromCurrentUser: true,
          isRead: true
        },
        unreadCount: 0
      },
      {
        id: 4,
        otherUser: {
          id: 'user5',
          name: 'Michael Thompson',
          businessName: 'Inner Light Healing',
          userType: 'practitioner',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          isOnline: false
        },
        lastMessage: {
          content: "I have availability this Friday afternoon for the shamanic healing session. Would 3 PM work for you?",
          timestamp: '2 days ago',
          isFromCurrentUser: false,
          isRead: false
        },
        unreadCount: 2
      },
      {
        id: 5,
        otherUser: {
          id: 'user6',
          name: 'Jennifer Martinez',
          businessName: null,
          userType: 'seeker',
          profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
          isOnline: true
        },
        lastMessage: {
          content: "Hi! I saw your post about chakra healing. I'd love to connect and share experiences!",
          timestamp: '3 days ago',
          isFromCurrentUser: false,
          isRead: true
        },
        unreadCount: 0
      }
    ]
    
    setConversations(mockConversations)
    setLoading(false)
  }, [])

  const filterOptions = [
    { id: 'all', name: 'All Messages', icon: '💬' },
    { id: 'practitioners', name: 'Practitioners', icon: '✨' },
    { id: 'seekers', name: 'Seekers', icon: '🔮' },
    { id: 'unread', name: 'Unread', icon: '🔴' }
  ]

  const filteredConversations = conversations.filter(conversation => {
    switch (selectedFilter) {
      case 'practitioners':
        return conversation.otherUser.userType === 'practitioner'
      case 'seekers':
        return conversation.otherUser.userType === 'seeker'
      case 'unread':
        return conversation.unreadCount > 0
      default:
        return true
    }
  })

  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="text-gray-600 text-lg">Loading messages...</span>
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
            <Link href="/community/feed" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-sm text-purple-600">Messages</p>
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
              <Link href={`/dashboard/${currentUser.userType}`} className="text-gray-700 hover:text-purple-600 transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Messages</h2>
              <p className="text-gray-600 mt-2">
                {totalUnreadCount > 0 ? `You have ${totalUnreadCount} unread message${totalUnreadCount === 1 ? '' : 's'}` : 'You\'re all caught up!'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{conversations.length} conversations</p>
            </div>
          </div>
        </div>

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
                {filter.id === 'unread' && totalUnreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {totalUnreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversations found</h3>
              <p className="text-gray-600 mb-6">
                {selectedFilter === 'unread' 
                  ? "You don't have any unread messages. Great job staying on top of your conversations!"
                  : "Start a conversation by visiting someone's profile and clicking the Message button."
                }
              </p>
              <Link 
                href="/community/feed" 
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Explore Community
              </Link>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.otherUser.id}`}
                className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-4">
                  {/* Profile Image with Online Status */}
                  <div className="relative">
                    <img
                      src={conversation.otherUser.profileImage}
                      alt={conversation.otherUser.name}
                      className="w-16 h-16 rounded-full"
                    />
                    {conversation.otherUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {conversation.otherUser.userType === 'practitioner' && conversation.otherUser.businessName
                          ? conversation.otherUser.businessName
                          : conversation.otherUser.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{conversation.lastMessage.timestamp}</span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      {conversation.otherUser.userType === 'practitioner' && conversation.otherUser.businessName && (
                        <span className="text-purple-600 text-sm">{conversation.otherUser.name}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        conversation.otherUser.userType === 'practitioner'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {conversation.otherUser.userType}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {conversation.lastMessage.isFromCurrentUser && (
                        <span className="text-gray-400 text-sm">You:</span>
                      )}
                      <p className={`text-sm truncate ${
                        conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                      }`}>
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesInbox() {
  return (
    <ProtectedRoute>
      <MessagesInboxContent />
    </ProtectedRoute>
  )
}