'use client';

import { useLogto } from '@logto/react';
import { useEffect, useCallback, useState } from 'react';
import { generateHasuraJWT, hasRole, hasOrganizationAccess } from '@/lib/logto-config.js';

interface UserInfo {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  organizations?: Organization[];
  roles?: string[];
  custom_data?: {
    tenant_id?: string;
    role?: string;
    permissions?: string[];
  };
}

interface Organization {
  id: string;
  name: string;
  role: 'admin' | 'tenant_admin' | 'user';
  permissions?: string[];
}

export function useAuth() {
  const { isAuthenticated, isLoading, getAccessToken, signIn, signOut, getIdTokenClaims, fetchUserInfo } = useLogto();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [hasuraToken, setHasuraToken] = useState<string | null>(null);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Get user info and claims
      Promise.all([
        fetchUserInfo(),
        getIdTokenClaims()
      ]).then(([userInfo, claims]) => {
        const fullUserInfo: UserInfo = {
          sub: userInfo?.sub || claims?.sub || '',
          email: userInfo?.email || claims?.email || undefined,
          name: userInfo?.name || claims?.name || undefined,
          picture: userInfo?.picture || claims?.picture || undefined,
          organizations: claims?.organizations as any[] || [],
          roles: claims?.roles as string[] || [],
          custom_data: claims?.custom_data as any
        };
        
        setUserInfo(fullUserInfo);
        
        // Set default organization if available
        const defaultOrg = fullUserInfo.organizations?.[0];
        if (defaultOrg && !currentOrgId) {
          setCurrentOrgId(defaultOrg.id);
        }
        
        // Generate Hasura JWT token
        const hasuraJWT = generateHasuraJWT(fullUserInfo, currentOrgId || defaultOrg?.id);
        const tokenString = JSON.stringify(hasuraJWT);
        setHasuraToken(tokenString);
        
        // Store tokens for Apollo Client
        localStorage.setItem('auth_token', tokenString);
        localStorage.setItem('tenant_id', currentOrgId || defaultOrg?.id || '');
        localStorage.setItem('tenant_name', defaultOrg?.name || '');
        localStorage.setItem('user_role', defaultOrg?.role || 'user');
      }).catch(console.error);
    } else {
      // Clear stored tokens if not authenticated
      setUserInfo(null);
      setHasuraToken(null);
      setCurrentOrgId(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('tenant_name');
      localStorage.removeItem('user_role');
    }
  }, [isAuthenticated, currentOrgId, getIdTokenClaims, fetchUserInfo]);

  const switchOrganization = useCallback((orgId: string) => {
    if (userInfo && hasOrganizationAccess(userInfo.organizations || [], orgId)) {
      setCurrentOrgId(orgId);
    }
  }, [userInfo]);

  const currentOrg = userInfo?.organizations?.find(org => org.id === currentOrgId);

  return {
    user: userInfo,
    hasuraToken,
    isLoading,
    isAuthenticated,
    tenantId: currentOrgId,
    tenantName: currentOrg?.name,
    role: currentOrg?.role,
    organizations: userInfo?.organizations || [],
    currentOrganization: currentOrg,
    switchOrganization,
    signIn,
    signOut,
    getAccessToken,
  };
}

export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signIn('/auth/callback');
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.signIn]);

  return auth;
}

export function useRequireRole(requiredRole: 'admin' | 'tenant_admin' | 'user') {
  const auth = useAuth();
  
  const hasAccess = useCallback(() => {
    if (!auth.role) return false;
    return hasRole(auth.role, requiredRole);
  }, [auth.role, requiredRole]);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signIn('/auth/callback');
    } else if (!auth.isLoading && auth.isAuthenticated && !hasAccess()) {
      window.location.href = '/unauthorized';
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.signIn, hasAccess]);

  return { ...auth, hasAccess: hasAccess() };
}