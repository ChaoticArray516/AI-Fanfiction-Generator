/**
 * User Subscription API Endpoint
 *
 * GET /api/user/subscription
 *
 * Returns the current user's subscription status, credits, and reset time
 */

import type { APIRoute } from 'astro';
import { userProfileDbService } from '@/db/queries';

export const GET: APIRoute = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userId = locals.user.id;

    // Try to get user profile
    let profile = await userProfileDbService.getByUserId(userId);

    // If profile doesn't exist (e.g., old user), create one
    if (!profile) {
      profile = await userProfileDbService.create(userId);
    }

    // Return subscription data
    return new Response(JSON.stringify({
      subscription: profile.subscription,
      credits: profile.credits,
      creditsResetAt: profile.creditsResetAt,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);

    return new Response(JSON.stringify({ error: 'Failed to fetch subscription data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
