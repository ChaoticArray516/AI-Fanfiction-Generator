/**
 * Astro Middleware
 *
 * This middleware runs on every request and:
 * - Validates user sessions from cookies
 * - Attachs user and session objects to Astro.locals
 * - Provides authentication state to all pages and API routes
 */

import { auth } from './auth';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    // Get session from request headers
    const sessionData = await auth.api.getSession({
      headers: context.request.headers,
    });

    // Attach user and session to locals
    if (sessionData?.user) {
      context.locals.user = sessionData.user;
      context.locals.session = sessionData.session;
    } else {
      context.locals.user = null;
      context.locals.session = null;
    }
  } catch (error) {
    // If session validation fails, clear locals
    console.error('Middleware session validation error:', error);
    context.locals.user = null;
    context.locals.session = null;
  }

  // Continue to the next middleware or route handler
  return next();
});
