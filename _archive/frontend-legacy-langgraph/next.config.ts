import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Map server-side Logto variables to client-side for build time
    NEXT_PUBLIC_LOGTO_ENDPOINT: process.env.LOGTO_ENDPOINT,
    NEXT_PUBLIC_LOGTO_APP_ID: process.env.LOGTO_APP_ID,
    // Note: LOGTO_APP_SECRETS should never be exposed to client
  },
  serverExternalPackages: ['@logto/next'],
  experimental: {
    // Experimental features for 12thhaus spiritual platform
  }
};

export default nextConfig;
