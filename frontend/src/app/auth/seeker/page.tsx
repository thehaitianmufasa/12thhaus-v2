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
import { ArrowLeft, ArrowRight, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const SPIRITUAL_INTERESTS = [
  'Tarot Reading',
  'Astrology',
  'Reiki Healing',
  'Chakra Balancing',
  'Meditation Guidance',
  'Life Coaching',
  'Crystal Healing',
  'Energy Clearing',
  'Past Life Regression',
  'Numerology'
];

export default function SeekerOnboardingPage() {
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
    
    // Step 2: Spiritual Profile
    experienceLevel: 'beginner',
    energySensitivity: 'standard',
    spiritualInterests: [] as string[],
    
    // Step 3: Preferences
    budgetRange: '$50-$100',
    sessionPreference: 'remote',
    goals: [] as string[],
    personalNote: ''
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

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      spiritualInterests: prev.spiritualInterests.includes(interest)
        ? prev.spiritualInterests.filter(i => i !== interest)
        : [...prev.spiritualInterests, interest]
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
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
              userType: 'seeker',
              experienceLevel: formData.experienceLevel,
              energySensitivity: formData.energySensitivity
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
      
      // Create seeker preferences
      await createSeekerPreferences(result.data.registerUser.token);
      
      router.push('/dashboard?welcome=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const createSeekerPreferences = async (token: string) => {
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: `
            mutation CreateSeekerPreferences($input: SeekerPreferencesInput!) {
              createSeekerPreferences(input: $input) {
                id
                budgetRange
                spiritualGoals
              }
            }
          `,
          variables: {
            input: {
              budgetRange: formData.budgetRange,
              sessionLengthPreference: 60,
              spiritualGoals: formData.goals,
              sessionPreference: formData.sessionPreference,
              personalNote: formData.personalNote
            }
          }
        })
      });
    } catch (err) {
      console.error('Failed to create seeker preferences:', err);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, Seeker</h2>
              <p className="text-gray-600">Let's create your spiritual journey profile</p>
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
              <h2 className="text-2xl font-bold text-gray-900">Your Spiritual Journey</h2>
              <p className="text-gray-600">Help us understand your spiritual path</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Experience Level</Label>
                <RadioGroup
                  value={formData.experienceLevel}
                  onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner">Beginner - New to spiritual practices</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediate - Some experience with spiritual practices</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced">Advanced - Experienced practitioner</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Energy Sensitivity</Label>
                <RadioGroup
                  value={formData.energySensitivity}
                  onValueChange={(value) => setFormData({ ...formData, energySensitivity: value })}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard - Normal sensitivity to energy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="highly_sensitive" id="highly_sensitive" />
                    <Label htmlFor="highly_sensitive">Highly Sensitive - Very aware of energy and emotions</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Spiritual Interests (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {SPIRITUAL_INTERESTS.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.spiritualInterests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                      />
                      <Label htmlFor={interest} className="text-sm">{interest}</Label>
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
              <h2 className="text-2xl font-bold text-gray-900">Preferences & Goals</h2>
              <p className="text-gray-600">Customize your spiritual experience</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Budget Range</Label>
                <RadioGroup
                  value={formData.budgetRange}
                  onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
                  className="mt-3"
                >
                  {['Under $50', '$50-$100', '$100-$150', '$150+'].map((range) => (
                    <div key={range} className="flex items-center space-x-2">
                      <RadioGroupItem value={range} id={range} />
                      <Label htmlFor={range}>{range}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Session Preference</Label>
                <RadioGroup
                  value={formData.sessionPreference}
                  onValueChange={(value) => setFormData({ ...formData, sessionPreference: value })}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remote" id="remote" />
                    <Label htmlFor="remote">Remote sessions only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <Label htmlFor="in-person">In-person sessions preferred</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both remote and in-person</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Spiritual Goals (select all that apply)</Label>
                <div className="space-y-2">
                  {[
                    'Self-discovery',
                    'Emotional healing',
                    'Spiritual growth',
                    'Relationship guidance',
                    'Career direction',
                    'Stress relief',
                    'Energy healing',
                    'Personal empowerment'
                  ].map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.goals.includes(goal)}
                        onCheckedChange={() => handleGoalToggle(goal)}
                      />
                      <Label htmlFor={goal}>{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="personalNote" className="text-base font-medium">Personal Note (Optional)</Label>
                <textarea
                  id="personalNote"
                  value={formData.personalNote}
                  onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
                  placeholder="Share anything about your spiritual journey that might help practitioners understand your needs..."
                  className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seeker Onboarding</h1>
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
                      (currentStep === 2 && formData.spiritualInterests.length === 0)
                    }
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-purple-600 hover:bg-purple-700 flex items-center"
                    disabled={loading || formData.goals.length === 0}
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}