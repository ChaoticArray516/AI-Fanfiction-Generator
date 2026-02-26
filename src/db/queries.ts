/**
 * Database Query Service
 *
 * Server-side database operations using Drizzle ORM
 */

import { eq, desc } from 'drizzle-orm';
import { db } from './index';
import * as schema from './schema';
import { createId } from '@paralleldrive/cuid2';

/**
 * Stories
 */
export const storyDbService = {
  /**
   * Get all stories for a user
   */
  async getAllForUser(userId: string) {
    const stories = await db.select()
      .from(schema.stories)
      .where(eq(schema.stories.userId, userId))
      .orderBy(desc(schema.stories.updatedAt));
    return stories;
  },

  /**
   * Get a single story by ID
   */
  async getById(id: string) {
    const stories = await db.select()
      .from(schema.stories)
      .where(eq(schema.stories.id, id))
      .limit(1);
    return stories[0] || null;
  },

  /**
   * Create a new story
   */
  async create(userId: string, title: string) {
    const newStory = {
      id: createId(),
      userId,
      title,
    };
    await db.insert(schema.stories).values(newStory);
    return newStory;
  },

  /**
   * Update a story
   */
  async update(id: string, data: Partial<schema.NewStory>) {
    await db.update(schema.stories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.stories.id, id));
  },

  /**
   * Delete a story and all its chapters/lore entries
   */
  async delete(id: string) {
    await db.delete(schema.stories).where(eq(schema.stories.id, id));
    // Cascade delete will handle chapters and lore entries
  },
};

/**
 * Chapters
 */
export const chapterDbService = {
  /**
   * Get all chapters for a story
   */
  async getAllForStory(storyId: string) {
    const chapters = await db.select()
      .from(schema.chapters)
      .where(eq(schema.chapters.storyId, storyId))
      .orderBy(schema.chapters.order);
    return chapters;
  },

  /**
   * Get a single chapter by ID
   */
  async getById(id: string) {
    const chapters = await db.select()
      .from(schema.chapters)
      .where(eq(schema.chapters.id, id))
      .limit(1);
    return chapters[0] || null;
  },

  /**
   * Create a new chapter
   */
  async create(storyId: string, title: string, order: number, content: string = '') {
    const newChapter = {
      id: createId(),
      storyId,
      title,
      content,
      order,
    };
    await db.insert(schema.chapters).values(newChapter);
    return newChapter;
  },

  /**
   * Update chapter content
   */
  async updateContent(id: string, content: string) {
    await db.update(schema.chapters)
      .set({ content, updatedAt: new Date() })
      .where(eq(schema.chapters.id, id));
  },

  /**
   * Update chapter
   */
  async update(id: string, data: Partial<schema.NewChapter>) {
    await db.update(schema.chapters)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.chapters.id, id));
  },

  /**
   * Delete a chapter
   */
  async delete(id: string) {
    await db.delete(schema.chapters).where(eq(schema.chapters.id, id));
  },
};

/**
 * Lore Entries
 */
export const loreDbService = {
  /**
   * Get all lore entries for a story
   */
  async getAllForStory(storyId: string) {
    const entries = await db.select()
      .from(schema.loreEntries)
      .where(eq(schema.loreEntries.storyId, storyId))
      .orderBy(schema.loreEntries.name);
    return entries;
  },

  /**
   * Create a new lore entry
   */
  async create(storyId: string, name: string, type: string, description: string) {
    const newEntry = {
      id: createId(),
      storyId,
      name,
      type,
      description,
    };
    await db.insert(schema.loreEntries).values(newEntry);
    return newEntry;
  },

  /**
   * Update a lore entry
   */
  async update(id: string, data: Partial<schema.NewLoreEntry>) {
    await db.update(schema.loreEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.loreEntries.id, id));
  },

  /**
   * Delete a lore entry
   */
  async delete(id: string) {
    await db.delete(schema.loreEntries).where(eq(schema.loreEntries.id, id));
  },
};
