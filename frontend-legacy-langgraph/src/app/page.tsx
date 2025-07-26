'use client';

import React from 'react';
import Link from 'next/link';

export default function SpiritualSanctuary() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">12H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">12thhaus</h1>
                <p className="text-xs text-purple-600 -mt-1">Spiritual Community</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-purple-700 text-sm font-medium bg-purple-50 border border-purple-100">
              🌟 Trusted by 10,000+ spiritual seekers
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Find Your Perfect
            <br />
            <span className="text-purple-600">Spiritual Guide</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with authentic practitioners for tarot readings, astrology sessions, 
            energy healing, and transformative spiritual guidance. Your journey to 
            self-discovery starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/register?type=seeker" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              🔮 Find Your Guide
            </Link>
            <Link href="/auth/register?type=practitioner" className="w-full sm:w-auto border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              ✨ Share Your Gifts
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-3">🔮</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Verified Practitioners</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-3">✨</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1,000+</div>
              <div className="text-gray-600 font-medium">Sessions Completed</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="text-4xl mb-3">⭐</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose 12thhaus?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've created a sacred space where authentic spiritual connection flourishes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Practitioners</h3>
              <p className="text-gray-600">
                Every practitioner is carefully vetted for authenticity, experience, and genuine spiritual wisdom.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌙</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Safe Sacred Space</h3>
              <p className="text-gray-600">
                A judgment-free environment designed for spiritual exploration, growth, and transformation.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Connection</h3>
              <p className="text-gray-600">
                Book sessions instantly or schedule for later. Connect via video, phone, or in-person.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Popular Spiritual Services
            </h2>
            <p className="text-xl text-gray-600">
              Discover the perfect guidance for your spiritual journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Tarot Reading', icon: '🔮', price: 'from $75' },
              { name: 'Astrology Chart', icon: '⭐', price: 'from $120' },
              { name: 'Energy Healing', icon: '✨', price: 'from $90' },
              { name: 'Life Coaching', icon: '🌟', price: 'from $100' },
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-purple-600 font-medium">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Your Spiritual Journey Awaits
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands who have found guidance, clarity, and transformation through our platform
          </p>
          
          <Link href="/auth/register" className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
            🌟 Start Your Journey
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">12H</span>
                </div>
                <span className="text-lg font-bold">12thhaus</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting authentic spiritual practitioners with seekers worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Seekers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/services" className="hover:text-white">Browse Services</Link></li>
                <li><Link href="/practitioners" className="hover:text-white">Find Practitioners</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Practitioners</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/join" className="hover:text-white">Join Us</Link></li>
                <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 12thhaus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}