/**
 * Better Auth Configuration
 *
 * Server-side authentication setup using Better Auth
 */

import pkg from 'pg';
import { betterAuth } from 'better-auth';
import { userProfileDbService } from './db/queries';

const { Pool } = pkg;

// Check if DATABASE_URL is available
const hasDatabase = !!import.meta.env.DATABASE_URL;

// Create database pool only if DATABASE_URL is configured
const database = hasDatabase
  ? new Pool({
      connectionString: import.meta.env.DATABASE_URL,
      // Enable SSL for production databases like Neon
      ssl: import.meta.env.DATABASE_URL?.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    })
  : null;

/**
 * Better Auth instance
 *
 * This handles all server-side authentication operations including:
 * - User registration and login
 * - Session management
 * - Password hashing and verification
 *
 * Note: For development, you need to set up a database.
 * Options:
 * 1. Use Neon (free Postgres): https://neon.tech
 * 2. Use local PostgreSQL: Install PostgreSQL locally
 * 3. Use Docker: docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
 */
export const auth = betterAuth({
  // Secret key for signing tokens (REQUIRED)
  secret: import.meta.env.BETTER_AUTH_SECRET || 'fallback-secret-change-in-production',

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    // Require email verification
    requireEmailVerification: false,
  },

  // Database connection
  database: database || undefined,

  // Advanced configuration
  advanced: {
    // Use secure cookies in production
    cookiePrefix: 'fanfic',
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Account configuration
  account: {
    accountLinking: {
      enabled: false,
    },
  },

  // Hooks to automatically initialize user profile after registration
  hooks: {
    after: [
      {
        matcher: (context) => {
          // Better-auth context structure check
          const path = context.path || context.request?.url || '';
          return path === '/sign-up/email';
        },
        handler: async (ctx) => {
          // When email registration succeeds, create default user profile
          const userId = ctx.context?.newSession?.user?.id;
          if (userId) {
            try {
              // Check if profile already exists (for idempotency)
              const existing = await userProfileDbService.getByUserId(userId);
              if (!existing) {
                await userProfileDbService.create(userId);
                console.log('User profile created for user:', userId);
              }
            } catch (error) {
              console.error('Failed to create user profile:', error);
            }
          }
        },
      },
    ],
  },
});

// Export database pool for direct access if needed
export { database };

/**
 * Helper function to check if auth is properly configured
 */
export function isAuthConfigured(): boolean {
  return hasDatabase && !!import.meta.env.BETTER_AUTH_SECRET;
}
