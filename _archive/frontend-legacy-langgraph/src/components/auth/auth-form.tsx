'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { gql, useMutation } from '@apollo/client';
import { setUserContext } from '@/lib/apollo-client';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        full_name
        user_type
      }
      expires_in
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: UserRegistrationInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        full_name
        user_type
      }
      expires_in
    }
  }
`;

interface AuthFormProps {
  mode?: 'login' | 'register';
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode = 'login' }) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [userType, setUserType] = useState<'seeker' | 'practitioner'>('seeker');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [register, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);

  const isLoading = loginLoading || registerLoading;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isLogin) {
        const { data } = await login({
          variables: {
            email: formData.email,
            password: formData.password,
          },
        });

        if (data?.login) {
          // Store auth token and user context
          localStorage.setItem('auth_token', data.login.token);
          setUserContext({
            userId: data.login.user.id,
            email: data.login.user.email,
            fullName: data.login.user.full_name,
            userType: data.login.user.user_type,
          });

          // Redirect based on user type
          if (data.login.user.user_type === 'practitioner') {
            router.push('/practitioner/dashboard');
          } else {
            router.push('/seeker/dashboard');
          }
        }
      } else {
        const { data } = await register({
          variables: {
            input: {
              email: formData.email,
              password: formData.password,
              full_name: formData.fullName,
              user_type: userType,
            },
          },
        });

        if (data?.register) {
          // Store auth token and user context
          localStorage.setItem('auth_token', data.register.token);
          setUserContext({
            userId: data.register.user.id,
            email: data.register.user.email,
            fullName: data.register.user.full_name,
            userType: data.register.user.user_type,
          });

          // Redirect to onboarding or dashboard
          if (userType === 'practitioner') {
            router.push('/practitioner/onboarding');
          } else {
            router.push('/seeker/dashboard');
          }
        }
      }
    } catch (error: any) {
      setErrors({
        form: error.message || 'An error occurred. Please try again.',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {isLogin ? 'Welcome Back' : 'Join 12thhaus'}
        </CardTitle>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
          {isLogin
            ? 'Sign in to your spiritual journey'
            : 'Begin your spiritual transformation'}
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserType('seeker')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      userType === 'seeker'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔮</div>
                      <div className="font-medium">Seeker</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Looking for guidance
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('practitioner')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      userType === 'practitioner'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">✨</div>
                      <div className="font-medium">Practitioner</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Offering services
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <Input
                label="Full Name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                placeholder="Enter your full name"
                required
              />
            </>
          )}

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="your@email.com"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            placeholder={isLogin ? 'Enter your password' : 'Create a password'}
            required
          />

          {!isLogin && (
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
            />
          )}

          {errors.form && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};