'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Heart, Sparkles, Users, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'join' | 'signin'>('join');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation LoginUser($email: String!, $password: String!) {
              loginUser(email: $email, password: $password) {
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
          variables: loginForm
        })
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Login failed');
      }

      // Store token and redirect
      localStorage.setItem('authToken', result.data.loginUser.token);
      localStorage.setItem('user', JSON.stringify(result.data.loginUser.user));
      
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">12H</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join Our Spiritual Community
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with experienced practitioners and seekers on transformative spiritual journeys
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'join'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Join Community
            </button>
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'signin'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {activeTab === 'join' ? (
            /* Join Community Section */
            <div className="grid md:grid-cols-2 gap-8">
              {/* Seeker Card */}
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 group-hover:from-purple-500/10 group-hover:to-purple-600/10 transition-colors" />
                <CardHeader className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-center text-2xl">I'm a Seeker</CardTitle>
                  <p className="text-center text-gray-600 mt-2">
                    Looking for spiritual guidance and transformative experiences
                  </p>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      <span>Browse and book spiritual services</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      <span>Connect with verified practitioners</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      <span>Join our spiritual community</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      <span>Track your spiritual journey</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 group-hover:bg-purple-700 transition-colors"
                    onClick={() => router.push('/auth/seeker')}
                  >
                    Get Started as Seeker
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Practitioner Card */}
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 group-hover:from-purple-500/10 group-hover:to-purple-600/10 transition-colors" />
                <CardHeader className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-center text-2xl">I'm a Practitioner</CardTitle>
                  <p className="text-center text-gray-600 mt-2">
                    Sharing my spiritual gifts and guiding others on their journey
                  </p>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      <span>Create and manage spiritual services</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      <span>Build your professional practice</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      <span>Connect with seeking souls</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      <span>Grow your spiritual community</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 group-hover:bg-purple-700 transition-colors"
                    onClick={() => router.push('/auth/practitioner')}
                  >
                    Get Started as Practitioner
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Sign In Section */
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Welcome Back</CardTitle>
                  <p className="text-center text-gray-600">
                    Sign in to your 12thhaus account
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      disabled={loading}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>

                  <div className="mt-4 text-center text-sm text-gray-600">
                    <Link href="/auth/forgot-password" className="text-purple-600 hover:text-purple-700">
                      Forgot your password?
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Community Stats */}
        <div className="mt-16 text-center">
          <div className="flex justify-center items-center mb-4">
            <Users className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-gray-600">Join our growing spiritual community</span>
          </div>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <div>
              <div className="font-semibold text-gray-900">2,500+</div>
              <div>Sessions Completed</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">50+</div>
              <div>Verified Practitioners</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">4.9★</div>
              <div>Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}