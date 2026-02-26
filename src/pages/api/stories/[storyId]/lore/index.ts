/**
 * Lore Entries API Endpoint
 *
 * GET /api/stories/[storyId]/lore - Get all lore entries for a story
 * POST /api/stories/[storyId]/lore - Create a new lore entry
 */

import type { APIRoute } from 'astro';
import { storyDbService, loreDbService } from '@/db/queries';

export const GET: APIRoute = async ({ locals, params }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify user owns the story
    const story = await storyDbService.getById(params.storyId);
    if (!story) {
      return new Response(JSON.stringify({ error: 'Story not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (story.userId !== locals.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const loreEntries = await loreDbService.getAllForStory(params.storyId);
    return new Response(JSON.stringify(loreEntries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching lore entries:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch lore entries' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ locals, params, request }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify user owns the story
    const story = await storyDbService.getById(params.storyId);
    if (!story) {
      return new Response(JSON.stringify({ error: 'Story not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (story.userId !== locals.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { name, type, description } = body;

    if (!name || typeof name !== 'string') {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!type || typeof type !== 'string') {
      return new Response(JSON.stringify({ error: 'Type is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newEntry = await loreDbService.create(
      params.storyId,
      name,
      type,
      description || ''
    );

    return new Response(JSON.stringify(newEntry), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating lore entry:', error);
    return new Response(JSON.stringify({ error: 'Failed to create lore entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
