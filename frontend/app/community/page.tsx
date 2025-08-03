import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function CommunityPage() {
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
              <Link href="/community" className="text-purple-600 font-medium">
                Community
              </Link>
              <Link href="/auth" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Join Community
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Coming Soon Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">🌟</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Spiritual Community
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect, share, and grow with like-minded spiritual seekers and practitioners. 
            Our community features are coming soon as part of Phase 5!
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon Features</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-purple-600">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Community Posts</h3>
                  <p className="text-gray-600 text-sm">Share insights, experiences, and spiritual wisdom</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-purple-600">📧</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Direct Messaging</h3>
                  <p className="text-gray-600 text-sm">Connect privately with practitioners and seekers</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-purple-600">👥</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Spiritual Groups</h3>
                  <p className="text-gray-600 text-sm">Join specialized groups based on interests and practices</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-purple-600">📅</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Community Events</h3>
                  <p className="text-gray-600 text-sm">Attend virtual and in-person spiritual gatherings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/community/feed" className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors">
              Explore Community Feed
            </Link>
            <Link href="/auth" className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors">
              Join Community
            </Link>
          </div>
        </div>
      </section>

      {/* Current Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Available Now
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔮</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Spiritual Services</h3>
              <p className="text-gray-600 mb-4">Browse and book from dozens of authentic spiritual services</p>
              <Link href="/services" className="text-purple-600 hover:text-purple-700 font-medium">
                Explore Services →
              </Link>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Practitioners</h3>
              <p className="text-gray-600 mb-4">Connect with experienced, verified spiritual practitioners</p>
              <Link href="/practitioners" className="text-purple-600 hover:text-purple-700 font-medium">
                Find Practitioners →
              </Link>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">User Dashboards</h3>
              <p className="text-gray-600 mb-4">Personalized dashboards for managing your spiritual journey</p>
              <Link href="/auth" className="text-purple-600 hover:text-purple-700 font-medium">
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}