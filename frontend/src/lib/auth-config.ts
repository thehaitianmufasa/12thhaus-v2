import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantName: string;
  role: 'admin' | 'tenant_admin' | 'user';
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        tenantId: { label: 'Tenant ID', type: 'text' },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // In a real implementation, you would validate credentials against your database
          // For now, we'll simulate a successful login
          const response = await fetch(`${process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Hasura-Admin-Secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET || '',
            },
            body: JSON.stringify({
              query: `
                query AuthenticateUser($email: String!, $tenant_id: uuid) {
                  users(where: {email: {_eq: $email}}) {
                    id
                    email
                    full_name
                    tenant_users(where: {tenant_id: {_eq: $tenant_id}}) {
                      role
                      status
                      tenant {
                        id
                        name
                        status
                      }
                    }
                  }
                }
              `,
              variables: {
                email: credentials.email,
                tenant_id: credentials.tenantId,
              },
            }),
          });

          const data = await response.json();
          const user = data.data?.users?.[0];
          
          if (!user || !user.tenant_users?.[0]) {
            return null;
          }

          const tenantUser = user.tenant_users[0];
          
          if (tenantUser.status !== 'active' || tenantUser.tenant.status !== 'active') {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            tenantId: tenantUser.tenant.id,
            tenantName: tenantUser.tenant.name,
            role: tenantUser.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as User;
        
        // Create Hasura JWT claims
        const hasuraClaims = {
          'x-hasura-allowed-roles': ['user', 'tenant_admin', 'admin'],
          'x-hasura-default-role': customUser.role,
          'x-hasura-user-id': customUser.id,
          'x-hasura-tenant-id': customUser.tenantId,
        };

        token.hasuraClaims = hasuraClaims;
        token.tenantId = customUser.tenantId;
        token.tenantName = customUser.tenantName;
        token.role = customUser.role;
        token.sub = customUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.tenantId = token.tenantId as string;
        session.user.tenantName = token.tenantName as string;
        session.user.role = token.role as string;
        
        // Generate JWT token for Hasura
        const hasuraToken = jwt.sign(
          {
            sub: token.sub,
            iat: Math.floor(Date.now() / 1000),
            'https://hasura.io/jwt/claims': token.hasuraClaims,
          },
          process.env.NEXTAUTH_SECRET || 'fallback-secret',
          { algorithm: 'HS256', expiresIn: '1h' }
        );
        
        session.hasuraToken = hasuraToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      tenantId: string;
      tenantName: string;
      role: string;
    };
    hasuraToken: string;
  }

  interface User {
    tenantId: string;
    tenantName: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    hasuraClaims: {
      'x-hasura-allowed-roles': string[];
      'x-hasura-default-role': string;
      'x-hasura-user-id': string;
      'x-hasura-tenant-id': string;
    };
    tenantId: string;
    tenantName: string;
    role: string;
  }
}