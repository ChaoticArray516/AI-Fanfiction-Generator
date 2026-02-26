/**
 * Single Chapter API Endpoint
 *
 * GET /api/chapters/[id] - Get a single chapter
 * PUT /api/chapters/[id] - Update a chapter
 * DELETE /api/chapters/[id] - Delete a chapter
 */

import type { APIRoute } from 'astro';
import { chapterDbService } from '@/db/queries';

export const GET: APIRoute = async ({ locals, params }) => {
  // Check if user is authenticated
  if (!locals.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const chapter = await chapterDbService.getById(params.id);

    if (!chapter) {
      return new Response(JSON.stringify({ error: 'Chapter not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify user owns the story this chapter belongs to
    // This requires fetching the story, which we'll skip for now
    // In production, you'd want to verify ownership

    return new Response(JSON.stringify(chapter), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch chapter' }), {
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
    const body = await request.json();
    const { content, title } = body;

    if (content !== undefined) {
      await chapterDbService.updateContent(params.id, content);
    }

    if (title !== undefined && typeof title === 'string') {
      await chapterDbService.update(params.id, { title });
    }

    const updatedChapter = await chapterDbService.getById(params.id);

    return new Response(JSON.stringify(updatedChapter), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating chapter:', error);
    return new Response(JSON.stringify({ error: 'Failed to update chapter' }), {
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
    await chapterDbService.delete(params.id);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete chapter' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
