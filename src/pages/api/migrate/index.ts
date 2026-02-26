/**
 * Guest Data Migration API Endpoint
 *
 * POST /api/migrate - Migrate guest story data to the database
 */

import type { APIRoute } from 'astro';
import { storyDbService, chapterDbService, loreDbService } from '@/db/queries';

interface MigrationData {
  title: string;
  chapters: Array<{
    title: string;
    content: string;
    order: number;
  }>;
  loreEntries: Array<{
    name: string;
    type: string;
    description: string;
  }>;
}

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
    const guestData: MigrationData = body.guestData;

    if (!guestData) {
      return new Response(JSON.stringify({ error: 'No guest data provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a new story for the user
    const newStory = await storyDbService.create(locals.user.id, guestData.title);

    // Migrate chapters
    for (const chapter of guestData.chapters) {
      await chapterDbService.create(
        newStory.id,
        chapter.title,
        chapter.order,
        chapter.content
      );
    }

    // Migrate lore entries
    for (const loreEntry of guestData.loreEntries) {
      await loreDbService.create(
        newStory.id,
        loreEntry.name,
        loreEntry.type,
        loreEntry.description
      );
    }

    return new Response(JSON.stringify({
      success: true,
      storyId: newStory.id,
      message: 'Your story has been successfully migrated!'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error migrating guest data:', error);
    return new Response(JSON.stringify({ error: 'Failed to migrate data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
