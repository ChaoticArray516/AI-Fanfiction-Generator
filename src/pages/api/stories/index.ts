/**
 * Stories API Endpoint
 *
 * GET /api/stories - Get all stories for the current user
 * POST /api/stories - Create a new story
 */

import type { APIRoute } from 'astro';
import { storyDbService } from '@/db/queries';

export const GET: APIRoute = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const stories = await storyDbService.getAllForUser(locals.user.id);
    return new Response(JSON.stringify(stories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch stories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ locals, request }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newStory = await storyDbService.create(locals.user.id, title);
    return new Response(JSON.stringify(newStory), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating story:', error);
    return new Response(JSON.stringify({ error: 'Failed to create story' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
