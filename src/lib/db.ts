/**
 * IndexedDB Database Service for AI Fanfiction Generator
 *
 * This service manages all local data persistence using the 'idb' library.
 * It provides a clean API for CRUD operations on stories, chapters, and lore entries.
 */

import { openDB } from 'idb';
import { createId } from '@paralleldrive/cuid2';

// ============================================
// Type Definitions
// ============================================

/**
 * Story object structure
 */
export interface Story {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Chapter object structure
 */
export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  content: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Lore entry object structure
 */
export interface LoreEntry {
  id: string;
  storyId: string;
  name: string;
  type: 'character' | 'location' | 'item' | 'faction' | 'custom';
  description: string;
  attributes?: Record<string, string>;
  createdAt: number;
}

/**
 * Database schema definition
 */
interface FanficDBSchema {
  stories: {
    key: string;
    value: Story;
    indexes: {
      'by-updatedAt': number;
    };
  };
  chapters: {
    key: string;
    value: Chapter;
    indexes: {
      'by-story': string;
      'by-order': number;
    };
  };
  lore_entries: {
    key: string;
    value: LoreEntry;
    indexes: {
      'by-story': string;
      'by-type': string;
    };
  };
}

// ============================================
// Database Connection
// ============================================

const DB_NAME = 'fanfic-db';
const DB_VERSION = 1;

/**
 * Opens and returns the IndexedDB database connection
 */
export async function getDB() {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stories store
      if (!db.objectStoreNames.contains('stories')) {
        const storyStore = db.createObjectStore('stories', { keyPath: 'id' });
        storyStore.createIndex('by-updatedAt', 'updatedAt');
      }

      // Create chapters store
      if (!db.objectStoreNames.contains('chapters')) {
        const chapterStore = db.createObjectStore('chapters', { keyPath: 'id' });
        chapterStore.createIndex('by-story', 'storyId');
        chapterStore.createIndex('by-order', 'order');
      }

      // Create lore_entries store
      if (!db.objectStoreNames.contains('lore_entries')) {
        const loreStore = db.createObjectStore('lore_entries', { keyPath: 'id' });
        loreStore.createIndex('by-story', 'storyId');
        loreStore.createIndex('by-type', 'type');
      }
    },
  });
}

// ============================================
// Database Service
// ============================================

export const dbService = {
  // ============================================
  // Story Operations
  // ============================================

  /**
   * Get all stories, sorted by updatedAt descending
   */
  async getAllStories(): Promise<Story[]> {
    const db = await getDB();
    return await db.getAll('stories');
  },

  /**
   * Get a single story by ID
   */
  async getStory(id: string): Promise<Story | undefined> {
    const db = await getDB();
    return await db.get('stories', id);
  },

  /**
   * Add a new story
   */
  async addStory(story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<Story> {
    const now = Date.now();
    const newStory: Story = {
      id: createId(),
      ...story,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDB();
    await db.add('stories', newStory);

    return newStory;
  },

  /**
   * Update an existing story
   */
  async updateStory(story: Story): Promise<void> {
    const updatedStory: Story = {
      ...story,
      updatedAt: Date.now(),
    };

    const db = await getDB();
    await db.put('stories', updatedStory);
  },

  /**
   * Delete a story and all its associated chapters and lore entries
   */
  async deleteStory(id: string): Promise<void> {
    const db = await getDB();

    // Delete the story
    await db.delete('stories', id);

    // Delete all chapters for this story
    const chapters = await db.getAllFromIndex('chapters', 'by-story', id);
    await Promise.all(chapters.map(chapter => db.delete('chapters', chapter.id)));

    // Delete all lore entries for this story
    const loreEntries = await db.getAllFromIndex('lore_entries', 'by-story', id);
    await Promise.all(loreEntries.map(entry => db.delete('lore_entries', entry.id)));
  },

  // ============================================
  // Chapter Operations
  // ============================================

  /**
   * Get all chapters for a given story, sorted by order
   */
  async getChaptersForStory(storyId: string): Promise<Chapter[]> {
    const db = await getDB();
    const chapters = await db.getAllFromIndex('chapters', 'by-story', storyId);
    return chapters.sort((a, b) => a.order - b.order);
  },

  /**
   * Get a single chapter by ID
   */
  async getChapter(id: string): Promise<Chapter | undefined> {
    const db = await getDB();
    return await db.get('chapters', id);
  },

  /**
   * Add a new chapter
   */
  async addChapter(chapter: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chapter> {
    const now = Date.now();
    const newChapter: Chapter = {
      id: createId(),
      ...chapter,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDB();
    await db.add('chapters', newChapter);

    return newChapter;
  },

  /**
   * Update chapter content
   */
  async updateChapterContent(chapterId: string, content: string): Promise<void> {
    const db = await getDB();
    const chapter = await db.get('chapters', chapterId);

    if (chapter) {
      const updatedChapter: Chapter = {
        ...chapter,
        content,
        updatedAt: Date.now(),
      };
      await db.put('chapters', updatedChapter);
    }
  },

  /**
   * Update a full chapter
   */
  async updateChapter(chapter: Chapter): Promise<void> {
    const updatedChapter: Chapter = {
      ...chapter,
      updatedAt: Date.now(),
    };

    const db = await getDB();
    await db.put('chapters', updatedChapter);
  },

  /**
   * Delete a chapter
   */
  async deleteChapter(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('chapters', id);
  },

  /**
   * Reorder chapters for a story
   */
  async reorderChapter(storyId: string, chapterId: string, newOrder: number): Promise<void> {
    const db = await getDB();
    const chapter = await db.get('chapters', chapterId);

    if (chapter && chapter.storyId === storyId) {
      const updatedChapter: Chapter = {
        ...chapter,
        order: newOrder,
        updatedAt: Date.now(),
      };
      await db.put('chapters', updatedChapter);
    }
  },

  // ============================================
  // Lore Entry Operations
  // ============================================

  /**
   * Get all lore entries for a story
   */
  async getLoreForStory(storyId: string): Promise<LoreEntry[]> {
    const db = await getDB();
    return await db.getAllFromIndex('lore_entries', 'by-story', storyId);
  },

  /**
   * Get a single lore entry by ID
   */
  async getLoreEntry(id: string): Promise<LoreEntry | undefined> {
    const db = await getDB();
    return await db.get('lore_entries', id);
  },

  /**
   * Add a new lore entry
   */
  async addLoreEntry(entry: Omit<LoreEntry, 'id' | 'createdAt'>): Promise<LoreEntry> {
    const newEntry: LoreEntry = {
      id: createId(),
      ...entry,
      createdAt: Date.now(),
    };

    const db = await getDB();
    await db.add('lore_entries', newEntry);

    return newEntry;
  },

  /**
   * Update a lore entry
   */
  async updateLoreEntry(entry: LoreEntry): Promise<void> {
    const db = await getDB();
    await db.put('lore_entries', entry);
  },

  /**
   * Delete a lore entry
   */
  async deleteLoreEntry(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('lore_entries', id);
  },

  // ============================================
  // Utility Functions
  // ============================================

  /**
   * Clear all data (useful for testing/debugging)
   */
  async clearAll(): Promise<void> {
    const db = await getDB();

    await Promise.all([
      db.clear('stories'),
      db.clear('chapters'),
      db.clear('lore_entries'),
    ]);
  },

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ stories: number; chapters: number; loreEntries: number }> {
    const db = await getDB();

    const [stories, chapters, loreEntries] = await Promise.all([
      db.count('stories'),
      db.count('chapters'),
      db.count('lore_entries'),
    ]);

    return { stories, chapters, loreEntries };
  },
};

// ============================================
// Export Types
// ============================================

export type { Story, Chapter, LoreEntry };
