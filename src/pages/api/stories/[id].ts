/**
 * Single Story API Endpoint
 *
 * GET /api/stories/[id] - Get a single story
 * PUT /api/stories/[id] - Update a story
 * DELETE /api/stories/[id] - Delete a story
 */

import type { APIRoute } from 'astro';
import { storyDbService } from '@/db/queries';

export const GET: APIRoute = async ({ locals, params }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const story = await storyDbService.getById(params.id);

    if (!story) {
      return new Response(JSON.stringify({ error: 'Story not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user owns this story
    if (story.userId !== locals.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(story), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch story' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const story = await storyDbService.getById(params.id);

    if (!story) {
      return new Response(JSON.stringify({ error: 'Story not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user owns this story
    if (story.userId !== locals.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { title } = body;

    if (title !== undefined && typeof title === 'string') {
      await storyDbService.update(params.id, { title });
    }

    const updatedStory = await storyDbService.getById(params.id);

    return new Response(JSON.stringify(updatedStory), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating story:', error);
    return new Response(JSON.stringify({ error: 'Failed to update story' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const story = await storyDbService.getById(params.id);

    if (!story) {
      return new Response(JSON.stringify({ error: 'Story not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user owns this story
    if (story.userId !== locals.user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await storyDbService.delete(params.id);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete story' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
