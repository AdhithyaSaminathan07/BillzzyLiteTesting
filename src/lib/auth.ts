// src/lib/auth.ts
// FINAL WORKING AND TYPE-SAFE CODE

import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';

import { clientPromise } from "@/lib/mongodb";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// Validate environment variables
const validateEnvVars = () => {
  const requiredVars = ['NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'MONGODB_URI'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  // Check NEXTAUTH_URL specifically
  if (!process.env.NEXTAUTH_URL) {
    console.warn('⚠️ NEXTAUTH_URL is not set. This may cause issues with OAuth redirects, especially when using custom domains or ngrok.');
    console.warn('Current Origin likely defaults to localhost.');
  } else {
    console.log(`✅ NEXTAUTH_URL is set to: ${process.env.NEXTAUTH_URL}`);
  }
};
validateEnvVars();

// Extract database name
const MONGODB_URI = process.env.MONGODB_URI;
const uri = new URL(MONGODB_URI!);
const dbName = uri.pathname.substring(1) || 'billzzyDB';

export const authOptions: NextAuthOptions = {
  // Use the Adapter and tell TypeScript to trust it is compatible.
  adapter: MongoDBAdapter(clientPromise, { databaseName: dbName }) as Adapter,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // NOTE: This will automatically link a Google sign-in to an existing
      // user with the same email. Use with caution.
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials) return null;

          if (credentials.email === process.env.ADMIN_EMAIL && credentials.password === process.env.ADMIN_PASSWORD) {
            return { id: 'master-admin-01', email: process.env.ADMIN_EMAIL, role: 'admin' };
          }

          await dbConnect();
          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user || !user.password) return null;

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId?.toString(),
            phoneNumber: user.phoneNumber
          };
        } catch (error) {
          console.error("🔥 UNEXPECTED ERROR IN AUTHORIZE FUNCTION 🔥", error);
          return null;
        }
      }
    })
  ],

  session: { strategy: "jwt" },

  // Correct, simplified callbacks that trust the Adapter
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.phoneNumber = user.phoneNumber;
      }

      // Update token if session is updated
      if (trigger === "update") {
        if (session?.phoneNumber) token.phoneNumber = session.phoneNumber;
        if (session?.name) token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.phoneNumber = token.phoneNumber as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
    error: '/',
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
