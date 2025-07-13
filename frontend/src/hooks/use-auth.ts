'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useCallback } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.hasuraToken) {
      // Store the Hasura token for Apollo Client
      localStorage.setItem('auth_token', session.hasuraToken);
      localStorage.setItem('tenant_id', session.user.tenantId);
      localStorage.setItem('tenant_name', session.user.tenantName);
      localStorage.setItem('user_role', session.user.role);
    } else {
      // Clear stored tokens if session is invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('tenant_name');
      localStorage.removeItem('user_role');
    }
  }, [session]);

  return {
    user: session?.user,
    hasuraToken: session?.hasuraToken,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    tenantId: session?.user?.tenantId,
    tenantName: session?.user?.tenantName,
    role: session?.user?.role,
  };
}

export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  return auth;
}

export function useRequireRole(requiredRole: 'admin' | 'tenant_admin' | 'user') {
  const auth = useAuth();
  
  const hasAccess = useCallback(() => {
    if (!auth.role) return false;
    
    const roleHierarchy = {
      admin: 3,
      tenant_admin: 2,
      user: 1,
    };
    
    return roleHierarchy[auth.role as keyof typeof roleHierarchy] >= 
           roleHierarchy[requiredRole];
  }, [auth.role, requiredRole]);

  useEffect(() => {
    if (!auth.isLoading && (!auth.isAuthenticated || !hasAccess())) {
      window.location.href = '/unauthorized';
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.role, hasAccess]);

  return { ...auth, hasAccess: hasAccess() };
}