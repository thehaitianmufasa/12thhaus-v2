'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

const SPECIALTIES = [
  'Tarot Reading',
  'Astrology',
  'Reiki Healing',
  'Chakra Balancing',
  'Meditation Guidance',
  'Life Coaching',
  'Crystal Healing',
  'Energy Clearing',
  'Past Life Regression',
  'Numerology',
  'Spiritual Counseling',
  'Intuitive Healing'
];

const CERTIFICATIONS = [
  'Certified Reiki Master',
  'Licensed Life Coach',
  'Certified Tarot Reader',
  'Astrology Certification',
  'Meditation Teacher Training',
  'Energy Healing Certification',
  'Crystal Healing Certification',
  'Yoga Teacher Training (200hr)',
  'Yoga Teacher Training (500hr)',
  'Other Professional Certification'
];

export default function PractitionerOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    
    // Step 2: Professional Profile
    businessName: '',
    businessBio: '',
    yearsOfExperience: '',
    specialties: [] as string[],
    certifications: [] as string[],
    
    // Step 3: Service Setup
    locationCity: '',
    locationState: '',
    offersRemote: true,
    offersInPerson: false,
    hourlyRate: '',
    acceptsSlidingScale: false,
    availabilityNotes: ''
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleCertificationToggle = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Register user
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation RegisterUser($input: UserRegistrationInput!) {
              registerUser(input: $input) {
                token
                user {
                  id
                  email
                  userType
                  fullName
                }
              }
            }
          `,
          variables: {
            input: {
              email: formData.email,
              password: formData.password,
              fullName: formData.fullName,
              userType: 'practitioner',
              experienceLevel: 'advanced',
              energySensitivity: 'highly_sensitive'
            }
          }
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('authToken', result.data.registerUser.token);
      localStorage.setItem('user', JSON.stringify(result.data.registerUser.user));
      
      // Create practitioner profile
      await createPractitionerProfile(result.data.registerUser.token);
      
      router.push('/dashboard?welcome=true&type=practitioner');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const createPractitionerProfile = async (token: string) => {
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            mutation CreatePractitionerProfile($input: PractitionerProfileInput!) {
              createPractitioner(input: $input) {
                id
                businessName
                specialties
              }
            }
          `,
          variables: {
            input: {
              businessName: formData.businessName,
              businessBio: formData.businessBio,
              yearsOfExperience: parseInt(formData.yearsOfExperience),
              specialties: formData.specialties,
              certifications: formData.certifications,
              locationCity: formData.locationCity,
              locationState: formData.locationState,
              offersRemote: formData.offersRemote,
              offersInPerson: formData.offersInPerson,
              hourlyRate: parseFloat(formData.hourlyRate) || 75,
              acceptsSlidingScale: formData.acceptsSlidingScale
            }
          }
        })
      });
    } catch (err) {
      console.error('Failed to create practitioner profile:', err);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, Practitioner</h2>
              <p className="text-gray-600">Let's set up your spiritual practice profile</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a secure password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Professional Profile</h2>
              <p className="text-gray-600">Tell us about your spiritual practice</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business/Practice Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g., Mystic Maya Spiritual Guidance"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessBio">About Your Practice</Label>
                <textarea
                  id="businessBio"
                  value={formData.businessBio}
                  onChange={(e) => setFormData({ ...formData, businessBio: e.target.value })}
                  placeholder="Describe your spiritual practice, approach, and what makes your services unique..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  placeholder="Years of professional practice"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Specialties (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {SPECIALTIES.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={() => handleSpecialtyToggle(specialty)}
                      />
                      <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Certifications (select all that apply)</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {CERTIFICATIONS.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Checkbox
                        id={cert}
                        checked={formData.certifications.includes(cert)}
                        onCheckedChange={() => handleCertificationToggle(cert)}
                      />
                      <Label htmlFor={cert} className="text-sm">{cert}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Service Setup</h2>
              <p className="text-gray-600">Configure your practice details</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locationCity">City</Label>
                  <Input
                    id="locationCity"
                    value={formData.locationCity}
                    onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                    placeholder="Boulder"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locationState">State</Label>
                  <Input
                    id="locationState"
                    value={formData.locationState}
                    onChange={(e) => setFormData({ ...formData, locationState: e.target.value })}
                    placeholder="Colorado"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Service Delivery Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="offersRemote"
                      checked={formData.offersRemote}
                      onCheckedChange={(checked) => setFormData({ ...formData, offersRemote: !!checked })}
                    />
                    <Label htmlFor="offersRemote">Offer remote/online sessions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="offersInPerson"
                      checked={formData.offersInPerson}
                      onCheckedChange={(checked) => setFormData({ ...formData, offersInPerson: !!checked })}
                    />
                    <Label htmlFor="offersInPerson">Offer in-person sessions</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Starting Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  placeholder="75"
                  min="0"
                />
                <p className="text-sm text-gray-600">This will be your base rate - you can adjust pricing for individual services</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptsSlidingScale"
                  checked={formData.acceptsSlidingScale}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptsSlidingScale: !!checked })}
                />
                <Label htmlFor="acceptsSlidingScale">I offer sliding scale pricing for accessibility</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availabilityNotes">Availability Notes (Optional)</Label>
                <textarea
                  id="availabilityNotes"
                  value={formData.availabilityNotes}
                  onChange={(e) => setFormData({ ...formData, availabilityNotes: e.target.value })}
                  placeholder="Share your typical availability, any scheduling preferences, or special notes..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/auth" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auth Options
          </Link>
          <div className="flex justify-center items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">12H</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Practitioner Onboarding</h1>
          <div className="max-w-md mx-auto">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">Step {currentStep} of {totalSteps}</p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {renderStep()}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNextStep}
                    className="bg-purple-600 hover:bg-purple-700 flex items-center"
                    disabled={
                      (currentStep === 1 && (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword)) ||
                      (currentStep === 2 && (!formData.businessName || !formData.businessBio || !formData.yearsOfExperience || formData.specialties.length === 0))
                    }
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-purple-600 hover:bg-purple-700 flex items-center"
                    disabled={loading || (!formData.offersRemote && !formData.offersInPerson)}
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                    <Star className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Note */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start">
              <Star className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-purple-900 mb-1">Professional Verification</h3>
                <p className="text-sm text-purple-700">
                  After registration, our team will review your profile and certifications. 
                  You'll receive a verification email within 2-3 business days to activate your practitioner status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}