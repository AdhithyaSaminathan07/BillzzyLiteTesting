// src/globals.d.ts

// import { DefaultSession, DefaultUser } from 'next-auth';
// import { JWT } from 'next-auth/jwt';

// --- Type declarations for next-pwa (Existing) ---
declare module "next-pwa" {
  import { NextConfig } from "next";

  interface PWAConfig {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
  }

  export default function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}


// --- Module augmentation for `next-auth` types (Moved to src/next-auth.d.ts) ---