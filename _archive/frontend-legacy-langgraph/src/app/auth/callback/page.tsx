'use client';

import { useEffect, Suspense } from 'react';
import { useLogto, useHandleSignInCallback } from '@logto/react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const { isAuthenticated } = useLogto();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { isLoading } = useHandleSignInCallback(() => {
    // Callback after successful authentication
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    router.push(redirectTo);
  });

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we sign you in</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}