'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_SPIRITUAL_DISCIPLINES } from '../lib/queries';

interface SpiritualDiscipline {
  id: string;
  name: string;
  category: string;
  description: string;
  typical_duration_minutes: number;
  typical_price_range_min: number;
  typical_price_range_max: number;
}

// Service category emoji mapping
const getServiceEmoji = (category: string) => {
  switch (category) {
    case 'divination': return '🔮';
    case 'astrology': return '⭐';
    case 'energy_healing': return '✨';
    case 'wellness': return '🌟';
    case 'coaching': return '🌙';
    case 'spiritual_therapy': return '💜';
    default: return '✨';
  }
};

export default function SpiritualLanding() {
  const { data, loading, error } = useQuery(GET_SPIRITUAL_DISCIPLINES);
  
  // Show first 4 disciplines for homepage display
  const featuredServices = data?.spiritual_disciplines?.slice(0, 4) || [];
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="nav sticky top-0 z-50">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1"></div>
            
            <div className="flex items-center">
              <img src="/12thhaus-logo.svg" alt="12thhaus" className="w-10 h-10" />
            </div>
            
            <div className="flex-1 flex justify-end items-center">
              <a href="/auth" className="btn btn-primary">
                👥 Join Community
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section hero-starfield">
        <div className="container text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Elevate Your Life
            <br />
            <span className="text-haus-gold">& Career</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white mb-8 max-w-4xl mx-auto leading-relaxed opacity-90">
            Connect with expert coaches who understand the modern woman's journey. Navigate career transitions, relationships, and life changes with confidence.
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center">
            <a href="/services" className="btn btn-primary btn-lg">
              🔮 Find Your Guide
            </a>
            <a href="/register?type=practitioner" className="btn btn-secondary btn-lg border-2 border-white">
              ✨ Share Your Gifts
            </a>
          </div>
        </div>
      </section>

      {/* Cosmic Divider */}
      <div className="cosmic-divider"></div>

      {/* Stats Section */}
      <section className="section-sm bg-gray-50">
        <div className="container">
          <div className="grid-3 text-center">
            <div className="card">
              <div className="spiritual-icon">🔮</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Verified Practitioners</div>
            </div>
            <div className="card">
              <div className="spiritual-icon">✨</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1,000+</div>
              <div className="text-gray-600 font-medium">Sessions Completed</div>
            </div>
            <div className="card">
              <div className="spiritual-icon">⭐</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.9</div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-haus-gold mb-6">
              Why Choose 12thhaus?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've created a sacred space where authentic spiritual connection flourishes
            </p>
          </div>
          
          <div className="grid-3">
            <div className="text-center mystical-feature">
              <div className="w-16 h-16 bg-haus-lavender rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="sacred-icon sacred-icon-shield"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Practitioners</h3>
              <p className="text-gray-600">
                Every practitioner is carefully vetted for authenticity, experience, and genuine spiritual wisdom.
              </p>
            </div>
            
            <div className="text-center mystical-feature">
              <div className="w-16 h-16 bg-haus-lavender rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="sacred-icon sacred-icon-moon"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Safe Sacred Space</h3>
              <p className="text-gray-600">
                A judgment-free environment designed for spiritual exploration, growth, and transformation.
              </p>
            </div>
            
            <div className="text-center mystical-feature">
              <div className="w-16 h-16 bg-haus-lavender rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="sacred-icon sacred-icon-lightning"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Instant Connection</h3>
              <p className="text-gray-600">
                Book sessions instantly or schedule for later. Connect via video, phone, or in-person.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cosmic Divider */}
      <div className="cosmic-divider"></div>

      {/* Services Section */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-haus-gold mb-6">
              Popular Spiritual Services
            </h2>
            <p className="text-xl text-gray-600">
              Discover the perfect guidance for your spiritual journey
            </p>
          </div>
          
          <div className="grid-4">
            {loading ? (
              // Loading state
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="service-card text-center">
                  <div className="text-3xl mb-4 animate-pulse">✨</div>
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-purple-100 rounded animate-pulse"></div>
                </div>
              ))
            ) : error ? (
              // Error state - fallback to static content
              <>
                <div className="service-card text-center">
                  <div className="text-3xl mb-4">🔮</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tarot Reading</h3>
                  <p className="text-haus-amethyst font-medium">from $75</p>
                </div>
                <div className="service-card text-center">
                  <div className="text-3xl mb-4">⭐</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Astrology Chart</h3>
                  <p className="text-haus-amethyst font-medium">from $120</p>
                </div>
                <div className="service-card text-center">
                  <div className="text-3xl mb-4">✨</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Energy Healing</h3>
                  <p className="text-haus-amethyst font-medium">from $90</p>
                </div>
                <div className="service-card text-center">
                  <div className="text-3xl mb-4">🌟</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Life Coaching</h3>
                  <p className="text-haus-amethyst font-medium">from $100</p>
                </div>
              </>
            ) : (
              // Real data from GraphQL API
              featuredServices.map((service: SpiritualDiscipline) => (
                <div key={service.id} className="service-card text-center">
                  <div className="text-3xl mb-4">{getServiceEmoji(service.category)}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-haus-amethyst font-medium">
                    from ${service.typical_price_range_min}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-haus-gold mb-6">
            Your Spiritual Journey Awaits
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands who have found guidance, clarity, and transformation through our platform
          </p>
          
          <a href="/register" className="btn btn-primary btn-lg">
            🌟 Start Your Journey
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container">
          <div className="grid-4">
            <div>
              <div className="mb-4">
                <span className="text-lg font-bold text-haus-gold">@12thhaus</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting authentic spiritual practitioners with seekers worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-haus-gold">For Seekers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/services" className="hover:text-white">Browse Services</a></li>
                <li><a href="/practitioners" className="hover:text-white">Find Practitioners</a></li>
                <li><a href="/how-it-works" className="hover:text-white">How It Works</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-haus-gold">For Practitioners</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/join" className="hover:text-white">Join Us</a></li>
                <li><a href="/resources" className="hover:text-white">Resources</a></li>
                <li><a href="/support" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-haus-gold">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-haus-gold mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 12thhaus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}