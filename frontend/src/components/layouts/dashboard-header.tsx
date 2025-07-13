'use client';

import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'next-auth/react';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, tenantName } = useAuth();

  return (
    <div className="sticky top-0 z-10 bg-white shadow">
      <div className="flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={onMenuClick}
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200 lg:hidden" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
            
            {/* Tenant info */}
            <div className="flex items-center gap-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {tenantName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {tenantName}
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-x-4 lg:gap-x-6">
            {/* User menu */}
            <div className="relative">
              <div className="flex items-center gap-x-3">
                <div className="hidden sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm font-semibold leading-6 text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-5 text-gray-500">
                    {user?.email}
                  </p>
                </div>
                
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="flex items-center gap-x-2 rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <span className="hidden sm:block">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}