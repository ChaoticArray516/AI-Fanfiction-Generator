/**
 * Chapters API Endpoint
 *
 * GET /api/stories/[storyId]/chapters - Get all chapters for a story
 * POST /api/stories/[storyId]/chapters - Create a new chapter
 */

import type { APIRoute } from 'astro';
import { storyDbService, chapterDbService } from '@/db/queries';

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

    const chapters = await chapterDbService.getAllForStory(params.storyId);
    return new Response(JSON.stringify(chapters), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch chapters' }), {
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
    const { title, order, content } = body;

    if (!title || typeof title !== 'string') {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (order === undefined || typeof order !== 'number') {
      return new Response(JSON.stringify({ error: 'Order is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newChapter = await chapterDbService.create(
      params.storyId,
      title,
      order,
      content || ''
    );

    return new Response(JSON.stringify(newChapter), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return new Response(JSON.stringify({ error: 'Failed to create chapter' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
