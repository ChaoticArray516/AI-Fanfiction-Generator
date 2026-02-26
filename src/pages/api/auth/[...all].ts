/**
 * Better Auth API Route
 *
 * Catch-all route for Better Auth operations
 * This handles all authentication requests including:
 * - Sign up
 * - Sign in
 * - Sign out
 * - Session management
 */

import { auth } from '../../../auth';
import type { APIRoute } from 'astro';

export const ALL: APIRoute = async (ctx) => {
  return auth.handler(ctx.request);
};

// Allow OPTIONS requests for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
