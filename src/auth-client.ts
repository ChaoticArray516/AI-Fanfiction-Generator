/**
 * Better Auth Client Configuration
 *
 * Client-side authentication hooks and utilities
 */

import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client instance
 *
 * Provides:
 * - authClient: Methods for sign up, sign in, sign out, etc.
 * - useSession: React hook for accessing session state
 *
 * @example
 * ```tsx
 * // Get session state
 * const { data: session, isPending, error } = useSession();
 *
 * if (isPending) return <p>Loading...</p>;
 * if (!session?.user) return <p>Not logged in</p>;
 * return <p>Welcome {session.user.name}</p>;
 *
 * // Sign up
 * await authClient.signUp.email({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   name: 'John Doe'
 * });
 *
 * // Sign in
 * await authClient.signIn.email({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 *
 * // Sign out
 * await authClient.signOut();
 * ```
 */
export const { useSession, authClient } = createAuthClient();

