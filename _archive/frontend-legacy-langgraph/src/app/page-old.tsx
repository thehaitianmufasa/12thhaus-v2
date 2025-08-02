'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ServiceCard } from '@/components/spiritual/service-card';

const featuredServices = [
  {
    id: '1',
    title: 'Personalized Tarot Reading',
    description: 'Gain insights into your spiritual path with a comprehensive 3-card tarot spread.',
    practitionerName: 'Luna Mystic',
    price: 85,
    duration: 45,
    category: 'Tarot',
    isRemote: true,
    isInPerson: false,
    rating: 4.9,
    totalReviews: 127,
  },
  {
    id: '2', 
    title: 'Chakra Alignment Session',
    description: 'Balance your energy centers through guided meditation and crystal healing.',
    practitionerName: 'River Stone',
    price: 120,
    duration: 60,
    category: 'Energy Healing',
    isRemote: true,
    isInPerson: true,
    rating: 4.8,
    totalReviews: 89,
  },
  {
    id: '3',
    title: 'Birth Chart Analysis',
    description: 'Discover your cosmic blueprint and understand your life purpose through astrology.',
    practitionerName: 'Celestial Dawn',
    price: 150,
    duration: 90,
    category: 'Astrology',
    isRemote: true,
    isInPerson: false,
    rating: 5.0,
    totalReviews: 203,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Navigation */}
      <nav className="mystical-nav relative z-50 border-b border-purple-200/30 sticky top-0">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl cosmic-bg flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white font-bold text-xl">12H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  12thhaus
                </h1>
                <p className="text-sm text-purple-600/70 -mt-1">✨ Spiritual Sanctuary</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-purple-700 hover:text-purple-900 hover:bg-purple-50/50">
                  ✨ Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm" className="cosmic-bg text-white hover:shadow-lg transition-all duration-300">
                  🌟 Enter Sanctuary
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="cosmic-hero relative py-32 px-6 sm:py-40 lg:px-8 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full text-purple-800 text-sm font-medium mb-8 backdrop-blur-sm border border-purple-200/50" style={{
              background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.1) 0%, rgba(99, 102, 241, 0.05) 25%, rgba(59, 130, 246, 0.05) 50%, rgba(99, 102, 241, 0.05) 75%, rgba(147, 51, 234, 0.1) 100%)'
            }}>
              🌟 Sacred space for 10,000+ spiritual souls ✨
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-12 leading-tight">
            <span className="bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-800 bg-clip-text text-transparent block mb-4">
              Welcome to Your
            </span>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-800 bg-clip-text text-transparent relative">
              Spiritual Sanctuary
              <div className="absolute -top-4 -right-8 text-4xl opacity-60 animate-pulse">✨</div>
              <div className="absolute -bottom-2 -left-8 text-3xl opacity-40 animate-pulse">🔮</div>
            </span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
            Step into a sacred digital realm where ancient wisdom meets modern connection. 
            <span className="text-purple-700 font-semibold">✨ Find your guide</span>, 
            <span className="text-indigo-700 font-semibold"> 🌙 share your gifts</span>, and 
            <span className="text-purple-800 font-semibold"> 🌟 transform your spiritual journey</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link href="/auth/register?type=seeker">
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-white hover:shadow-2xl px-10 py-5 text-lg transform hover:scale-105 transition-all duration-300" style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #6366f1 100%)'
              }}>
                🔮 Find Your Guide
              </Button>
            </Link>
            <Link href="/auth/register?type=practitioner">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto border-purple-200 text-purple-800 hover:shadow-xl px-10 py-5 text-lg hover:border-purple-300 transition-all duration-300 backdrop-blur-sm" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 246, 255, 0.9) 50%, rgba(255, 255, 255, 0.95) 100%)'
              }}>
                ✨ Share Your Gifts
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 text-center">
            <div className="mystical-card p-8 rounded-2xl shadow-lg">
              <div className="text-5xl mb-4">🔮</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent mb-3">50+</div>
              <div className="text-purple-700 font-medium">Sacred Practitioners</div>
            </div>
            <div className="mystical-card p-8 rounded-2xl shadow-lg">
              <div className="text-5xl mb-4">✨</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-3">1000+</div>
              <div className="text-purple-700 font-medium">Transformative Sessions</div>
            </div>
            <div className="mystical-card p-8 rounded-2xl shadow-lg">
              <div className="text-5xl mb-4">🌟</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent mb-3">4.9</div>
              <div className="text-purple-700 font-medium">Cosmic Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6 lg:px-8 gradient-ethereal overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold mb-8 ethereal-float">
              <span className="bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 bg-clip-text text-transparent">
                Why Our Sanctuary Is Sacred
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              Experience authentic spiritual connection in a protected sacred space designed for 
              <span className="text-purple-700 font-semibold"> genuine seekers </span> and 
              <span className="text-indigo-700 font-semibold"> trusted practitioners</span>.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="gradient-card-mystical rounded-3xl p-10 text-center shadow-xl hover:shadow-2xl transition-all duration-500 cosmic-pulse">
              <div className="w-20 h-20 rounded-3xl gradient-cosmic flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-4xl">🔮</span>
              </div>
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Sacred Practitioners</h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Every practitioner passes through our spiritual vetting process to ensure 
                <span className="text-purple-700 font-semibold"> authentic wisdom </span> and 
                <span className="text-indigo-700 font-semibold"> pure intentions</span>.
              </p>
            </div>
            
            <div className="gradient-card-mystical rounded-3xl p-10 text-center shadow-xl hover:shadow-2xl transition-all duration-500 cosmic-pulse" style={{ animationDelay: '0.5s' }}>
              <div className="w-20 h-20 rounded-3xl gradient-celestial flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-4xl">🌙</span>
              </div>
              <h3 className="text-2xl font-bold text-indigo-800 mb-6">Protected Space</h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Built with reverence for all spiritual paths. A 
                <span className="text-purple-700 font-semibold"> judgment-free sanctuary </span> 
                for exploration, growth, and transformation.
              </p>
            </div>
            
            <div className="gradient-card-mystical rounded-3xl p-10 text-center shadow-xl hover:shadow-2xl transition-all duration-500 cosmic-pulse" style={{ animationDelay: '1s' }}>
              <div className="w-20 h-20 rounded-3xl gradient-cosmic flex items-center justify-center mx-auto mb-8 shadow-lg">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-purple-800 mb-6">Instant Connection</h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Connect instantly with your ideal guide through 
                <span className="text-indigo-700 font-semibold"> mystical matching </span> and 
                <span className="text-purple-700 font-semibold"> sacred scheduling</span>.
              </p>
            </div>
          </div>
        </div>
        
        {/* Background cosmic elements */}
        <div className="absolute top-20 left-10 w-32 h-32 opacity-10">
          <div className="w-full h-full rounded-full gradient-cosmic animate-pulse"></div>
        </div>
        <div className="absolute bottom-20 right-10 w-24 h-24 opacity-10">
          <div className="w-full h-full rounded-full gradient-celestial animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Featured Spiritual Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover transformative experiences with our top-rated practitioners who are ready to guide you on your spiritual journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredServices.map((service) => (
              <ServiceCard
                key={service.id}
                {...service}
                onBook={() => console.log('Book service:', service.id)}
                onViewDetails={() => console.log('View details:', service.id)}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/services">
              <Button variant="primary" size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-4 text-lg">
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-32 px-6 lg:px-8 gradient-cosmic overflow-hidden">
        <div className="absolute inset-0 starfield opacity-30"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-8 ethereal-float">
            Your Sacred Journey Awaits
          </h2>
          <p className="text-xl text-purple-100 mb-12 leading-relaxed max-w-3xl mx-auto font-medium">
            Whether you're a seeker ready for transformation or a practitioner called to share your gifts, 
            <span className="text-white font-semibold"> ✨ our sanctuary </span> provides the perfect sacred space for 
            <span className="text-purple-200 font-semibold"> 🌟 authentic spiritual connection</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth/register">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white/95 text-purple-800 hover:bg-white hover:shadow-2xl px-10 py-5 text-lg font-semibold cosmic-pulse backdrop-blur-sm">
                🌟 Enter Our Sanctuary
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-white/80 text-white hover:bg-white/10 hover:border-white px-10 py-5 text-lg font-semibold ethereal-float backdrop-blur-sm">
                ✨ Discover the Magic
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">12H</span>
                </div>
                <h3 className="text-xl font-bold">12thhaus</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Connecting authentic spiritual practitioners with seekers worldwide through our trusted platform.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.743 3.708 12.446s.49-2.449 1.297-3.324C5.901 8.247 7.052 7.757 8.349 7.757s2.448.49 3.323 1.297c.807.875 1.297 2.027 1.297 3.324s-.49 2.449-1.297 3.324c-.875.807-2.026 1.297-3.323 1.297z" clipRule="evenodd"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-white">For Seekers</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/services" className="hover:text-white transition-colors">Browse Services</Link></li>
                <li><Link href="/practitioners" className="hover:text-white transition-colors">Find Practitioners</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/testimonials" className="hover:text-white transition-colors">Testimonials</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-white">For Practitioners</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/practitioner/join" className="hover:text-white transition-colors">Join as Practitioner</Link></li>
                <li><Link href="/practitioner/resources" className="hover:text-white transition-colors">Resources</Link></li>
                <li><Link href="/practitioner/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/practitioner/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-white">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community Guidelines</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 12thhaus. All rights reserved. Built with love for the spiritual community.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
