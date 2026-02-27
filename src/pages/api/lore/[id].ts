/**
 * Single Lore Entry API Endpoint
 *
 * PUT /api/lore/[id] - Update a lore entry
 * DELETE /api/lore/[id] - Delete a lore entry
 */

import type { APIRoute } from 'astro';
import { loreDbService } from '@/db/queries';

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
    const { name, type, description } = body;

    // Update the lore entry
    await loreDbService.update(params.id, {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(description !== undefined && { description }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating lore entry:', error);
    return new Response(JSON.stringify({ error: 'Failed to update lore entry' }), {
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
    await loreDbService.delete(params.id);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error('Error deleting lore entry:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete lore entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
