/**
 * User Profile API Endpoint
 *
 * PUT /api/user/profile
 *
 * Updates the user's profile information (e.g., display name)
 */

import type { APIRoute } from 'astro';
import { userProfileDbService } from '@/db/queries';

export const PUT: APIRoute = async ({ request, locals }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userId = locals.user.id;
    const body = await request.json();
    const { name } = body;

    // Validate input
    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (name.length > 100) {
      return new Response(JSON.stringify({ error: 'Name is too long (max 100 characters)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update user profile
    await userProfileDbService.update(userId, { name });

    // Return success
    return new Response(JSON.stringify({
      success: true,
      message: 'Profile updated successfully',
      name,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);

    return new Response(JSON.stringify({
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// GET endpoint to retrieve current profile
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

    // Get user profile
    const profile = await userProfileDbService.getByUserId(userId);

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return profile data
    return new Response(JSON.stringify({
      id: profile.id,
      name: profile.name,
      subscription: profile.subscription,
      credits: profile.credits,
      creditsResetAt: profile.creditsResetAt,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);

    return new Response(JSON.stringify({
      error: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
