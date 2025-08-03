import Link from 'next/link'
import { Navigation } from '../components/navigation'
import { HeroActions } from '../components/hero-actions'
import { FeaturedPractitioners } from '../components/featured-practitioners'

export const dynamic = 'force-dynamic'

export default function Home() {
  const services = [
    {
      id: 1,
      name: 'Tarot Reading',
      price: '75',
      icon: '🔮',
      description: 'Receive sacred wisdom and clarity through authentic tarot readings with certified practitioners'
    },
    {
      id: 2,
      name: 'Reiki Healing',
      price: '65',
      icon: '✨',
      description: 'Experience profound healing and balance through certified Reiki energy work'
    },
    {
      id: 3,
      name: 'Astrology Reading',
      price: '150',
      icon: '⭐',
      description: 'Uncover your soul\'s purpose and divine timing through professional astrological guidance'
    }
  ]

  const features = [
    {
      title: 'Trusted Practitioners',
      description: 'All spiritual guides are carefully vetted, certified, and experienced in creating safe, sacred healing spaces.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Intuitive Connections',
      description: 'We thoughtfully match you with practitioners perfectly aligned to your spiritual needs and healing journey.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: 'Sacred Community',
      description: 'Join a supportive circle of seekers and experienced practitioners on authentic spiritual growth paths.',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-sm text-purple-600">Spiritual Community Platform</p>
              </div>
            </div>
            <Navigation />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Spiritual Path
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with trusted spiritual guides who understand your unique path to healing and growth. Find clarity, balance, and inner wisdom through authentic spiritual practices.
          </p>
          <HeroActions />
        </div>
      </section>

      {/* Featured Practitioners Section */}
      <FeaturedPractitioners />

      {/* Why Choose Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose 12thhaus?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our sacred platform connects you with experienced spiritual guides who create personalized, transformative healing experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sacred Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover transformative spiritual practices tailored to your healing journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-purple-100"
              >
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {service.description}
                  </p>
                  <div className="text-2xl font-bold text-purple-600 mb-4">
                    ${service.price}
                  </div>
                  <Link href={`/book/${service.id}`} className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium text-center">
                    Book Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">12H</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">12thhaus</h3>
                <p className="text-sm text-gray-400">Spiritual Community Platform</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2025 12thhaus. All rights reserved.</p>
              <p className="text-sm text-gray-500 mt-1">Connecting souls, transforming lives</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
