'use client';

import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(createClient({
  url: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_WS_URL || 'ws://localhost:8080/v1/graphql',
  connectionParams: () => {
    const token = localStorage.getItem('auth_token');
    const tenantId = localStorage.getItem('tenant_id');
    
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'X-Hasura-Tenant-Id': tenantId || '',
      },
    };
  },
})) : null;

const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink,
    )
  : httpLink;

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions
      );
      
      if (extensions?.code === 'invalid-jwt' || extensions?.code === 'access-denied') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('tenant_id');
          window.location.href = '/auth/login';
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('tenant_id');
        window.location.href = '/auth/login';
      }
    }
  }
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        spiritual_disciplines: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        practitioners: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        service_offerings: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        spiritual_bookings: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    Practitioner: {
      fields: {
        service_offerings: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        spiritual_bookings: {
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export interface UserContext {
  userId: string;
  email: string;
  fullName: string;
  userType: 'seeker' | 'practitioner' | 'both';
  practitionerId?: string; // Only for practitioners
}

export const getUserContext = (): UserContext | null => {
  if (typeof window === 'undefined') return null;
  
  const userId = localStorage.getItem('user_id');
  const email = localStorage.getItem('user_email');
  const fullName = localStorage.getItem('user_full_name');
  const userType = localStorage.getItem('user_type') as UserContext['userType'];
  const practitionerId = localStorage.getItem('practitioner_id');
  
  if (!userId || !email || !fullName || !userType) return null;
  
  return { userId, email, fullName, userType, practitionerId: practitionerId || undefined };
};

export const setUserContext = (context: UserContext) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('user_id', context.userId);
  localStorage.setItem('user_email', context.email);
  localStorage.setItem('user_full_name', context.fullName);
  localStorage.setItem('user_type', context.userType);
  if (context.practitionerId) {
    localStorage.setItem('practitioner_id', context.practitionerId);
  }
};

export const clearUserContext = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_full_name');
  localStorage.removeItem('user_type');
  localStorage.removeItem('practitioner_id');
  localStorage.removeItem('auth_token');
};