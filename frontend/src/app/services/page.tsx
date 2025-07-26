'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_SPIRITUAL_DISCIPLINES } from '../../lib/queries';

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

// Category display names
const getCategoryName = (category: string) => {
  switch (category) {
    case 'divination': return 'Divination';
    case 'astrology': return 'Astrology';
    case 'energy_healing': return 'Energy Healing';
    case 'wellness': return 'Wellness';
    case 'coaching': return 'Spiritual Coaching';
    case 'spiritual_therapy': return 'Spiritual Therapy';
    default: return 'Spiritual Services';
  }
};

export default function ServicesPage() {
  const { data, loading, error } = useQuery(GET_SPIRITUAL_DISCIPLINES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const disciplines = data?.spiritual_disciplines || [];
  
  // Get unique categories with safety check
  const categories = disciplines.length > 0 
    ? ['all', ...new Set(disciplines.map((d: SpiritualDiscipline) => d.category))]
    : ['all'];
  
  // Filter disciplines by category
  const filteredDisciplines = selectedCategory === 'all' 
    ? disciplines 
    : disciplines.filter((d: SpiritualDiscipline) => d.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-haus-amethyst via-haus-violet to-haus-midnight">
      {/* Navigation */}
      <nav className="nav sticky top-0 z-50">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1"></div>
            
            <div className="flex items-center">
              <a href="/">
                <img src="/12thhaus-logo.svg" alt="12thhaus" className="w-10 h-10" />
              </a>
            </div>
            
            <div className="flex-1 flex justify-end items-center">
              <a href="/register" className="btn btn-primary">
                👥 Join Community
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-haus-gold mb-6">
            Browse Spiritual Services
          </h1>
          <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
            Discover authentic spiritual guidance from verified practitioners
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-haus-gold text-haus-black shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-lg'
                }`}
              >
                {category === 'all' ? '✨ All Services' : `${getServiceEmoji(category)} ${getCategoryName(category)}`}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-haus-gold"></div>
            <p className="text-white mt-4">Loading spiritual services...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-white">Unable to load services. Please try again.</p>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDisciplines.map((service: SpiritualDiscipline) => (
                <div key={service.id} className="service-card group cursor-pointer">
                  <div className="text-center">
                    <div className="text-4xl mb-4">{getServiceEmoji(service.category)}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-haus-amethyst font-medium mb-4">
                      from ${service.typical_price_range_min}
                    </p>
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {service.description || `Professional ${service.name.toLowerCase()} sessions with experienced practitioners.`}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                      <span>{service.typical_duration_minutes} minutes</span>
                      <span className="capitalize">{getCategoryName(service.category)}</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="flex-1 bg-haus-amethyst hover:bg-haus-violet text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        Book Now
                      </button>
                      <button className="flex-1 border border-haus-amethyst text-haus-amethyst hover:bg-haus-amethyst hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-center mt-12">
              <p className="text-white opacity-75">
                Showing {filteredDisciplines.length} {filteredDisciplines.length === 1 ? 'service' : 'services'}
                {selectedCategory !== 'all' && ` in ${getCategoryName(selectedCategory)}`}
              </p>
            </div>
          </>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16 py-12">
          <h2 className="text-3xl font-bold text-haus-gold mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Join thousands who have found guidance and transformation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register?type=seeker" className="btn btn-primary btn-lg">
              🔮 Get Started
            </a>
            <a href="/" className="btn btn-secondary btn-lg">
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

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