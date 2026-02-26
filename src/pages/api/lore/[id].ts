/**
 * Single Lore Entry API Endpoint
 *
 * DELETE /api/lore/[id] - Delete a lore entry
 */

import type { APIRoute } from 'astro';
import { loreDbService } from '@/db/queries';

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
