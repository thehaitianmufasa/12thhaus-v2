'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  practitionerName: string;
  practitionerImage?: string;
  price: number;
  duration: number;
  category: string;
  isRemote: boolean;
  isInPerson: boolean;
  rating?: number;
  totalReviews?: number;
  onBook?: () => void;
  onViewDetails?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  description,
  practitionerName,
  practitionerImage,
  price,
  duration,
  category,
  isRemote,
  isInPerson,
  rating,
  totalReviews,
  onBook,
  onViewDetails,
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'Tarot': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Astrology': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Energy Healing': 'bg-green-50 text-green-700 border border-green-200',
      'Meditation': 'bg-teal-50 text-teal-700 border border-teal-200',
      'Crystal Healing': 'bg-pink-50 text-pink-700 border border-pink-200',
      'Spiritual Counseling': 'bg-amber-50 text-amber-700 border border-amber-200',
    };
    return colors[cat] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  return (
    <div className="gradient-card-mystical rounded-3xl p-8 h-full flex flex-col hover:shadow-2xl transition-all duration-500 cosmic-pulse border border-purple-100/30 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start mb-4">
          <span className={clsx(
            'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
            getCategoryColor(category)
          )}>
            {category}
          </span>
          <div className="flex gap-2">
            {isRemote && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Remote
              </span>
            )}
            {isInPerson && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                In-Person
              </span>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3 leading-tight line-clamp-2">
          {title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-600">
          {practitionerImage ? (
            <Image
              src={practitionerImage}
              alt={practitionerName}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full mr-3 object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-purple-100 mr-3 flex items-center justify-center">
              <span className="text-sm font-medium text-purple-700">
                {practitionerName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-medium">{practitionerName}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-grow mb-6">
        <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {formatPrice(price)}
            </p>
            <p className="text-sm text-gray-500">
              {formatDuration(duration)} session
            </p>
          </div>
          
          {rating && totalReviews !== undefined && (
            <div className="text-right">
              <div className="flex items-center justify-end mb-1">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">
                  {rating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={onViewDetails}
          className="bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
        >
          View Details
        </Button>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={onBook}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};