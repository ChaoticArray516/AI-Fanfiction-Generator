/**
 * Data Service - Abstraction Layer
 *
 * Provides a unified interface for data operations, automatically routing
 * between authenticated (API) and guest (localStorage) modes.
 *
 * This layer ensures that components and stores don't need to know
 * whether the user is logged in or using guest mode.
 */

import { storiesApi, chaptersApi, loreApi } from './apiService';
import { guestDataManager } from './guestDataManager';

// Re-export types from API service
export type { Story, Chapter, LoreEntry } from './apiService';

/**
 * Check if user is authenticated
 * In a real app, this would check the session or auth context
 * For now, we'll check if there's a user in localStorage (set by auth)
 */
function isAuthenticated(): boolean {
  try {
    // Check for session token or user data
    return !!localStorage.getItem('better-auth.session_token') ||
           !!document.cookie.includes('better-auth.session_token');
  } catch {
    return false;
  }
}

/**
 * Stories Service
 * Automatically switches between API and guest storage
 */
export const storiesService = {
  /**
   * Get all stories
   */
  async getAll(): Promise<Story[]> {
    if (isAuthenticated()) {
      return storiesApi.getAll();
    } else {
      // Guest mode: return the single guest story as an array
      const guestStory = guestDataManager.getStory();
      return guestStory ? [{
        id: guestStory.id,
        userId: 'guest',
        title: guestStory.title,
        createdAt: guestStory.createdAt,
        updatedAt: guestStory.updatedAt,
      }] : [];
    }
  },

  /**
   * Get a story by ID
   */
  async getById(id: string): Promise<Story> {
    if (isAuthenticated()) {
      return storiesApi.getById(id);
    } else {
      // Guest mode: return the guest story if IDs match
      const guestStory = guestDataManager.getStory();
      if (!guestStory || guestStory.id !== id) {
        throw new Error('Story not found');
      }
      return {
        id: guestStory.id,
        userId: 'guest',
        title: guestStory.title,
        createdAt: guestStory.createdAt,
        updatedAt: guestStory.updatedAt,
      };
    }
  },

  /**
   * Create a new story
   */
  async create(title: string): Promise<Story> {
    if (isAuthenticated()) {
      return storiesApi.create(title);
    } else {
      // Guest mode: initialize the guest story
      const guestStory = guestDataManager.initializeStory(title);
      return {
        id: guestStory.id,
        userId: 'guest',
        title: guestStory.title,
        createdAt: guestStory.createdAt,
        updatedAt: guestStory.updatedAt,
      };
    }
  },

  /**
   * Update a story
   */
  async update(id: string, data: { title?: string }): Promise<Story> {
    if (isAuthenticated()) {
      return storiesApi.update(id, data);
    } else {
      // Guest mode: update the guest story title
      if (data.title) {
        guestDataManager.updateTitle(data.title);
      }
      const guestStory = guestDataManager.getStory();
      if (!guestStory) {
        throw new Error('Story not found');
      }
      return {
        id: guestStory.id,
        userId: 'guest',
        title: guestStory.title,
        createdAt: guestStory.createdAt,
        updatedAt: guestStory.updatedAt,
      };
    }
  },

  /**
   * Delete a story
   */
  async delete(id: string): Promise<void> {
    if (isAuthenticated()) {
      return storiesApi.delete(id);
    } else {
      // Guest mode: clear guest data
      const guestStory = guestDataManager.getStory();
      if (guestStory && guestStory.id === id) {
        guestDataManager.clearData();
      }
    }
  },
};

/**
 * Chapters Service
 * Automatically switches between API and guest storage
 */
export const chaptersService = {
  /**
   * Get all chapters for a story
   */
  async getAllForStory(storyId: string): Promise<Chapter[]> {
    if (isAuthenticated()) {
      return chaptersApi.getAllForStory(storyId);
    } else {
      // Guest mode: return chapters from guest story
      const guestStory = guestDataManager.getStory();
      if (!guestStory || guestStory.id !== storyId) {
        return [];
      }
      return guestStory.chapters.map(ch => ({
        id: ch.id,
        storyId: ch.storyId,
        title: ch.title,
        content: ch.content,
        order: ch.order,
        createdAt: ch.createdAt,
        updatedAt: ch.updatedAt,
      }));
    }
  },

  /**
   * Get a chapter by ID
   */
  async getById(id: string): Promise<Chapter> {
    if (isAuthenticated()) {
      return chaptersApi.getById(id);
    } else {
      // Guest mode: find chapter in guest story
      const chapter = guestDataManager.getChapter(id);
      if (!chapter) {
        throw new Error('Chapter not found');
      }
      return {
        id: chapter.id,
        storyId: chapter.storyId,
        title: chapter.title,
        content: chapter.content,
        order: chapter.order,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      };
    }
  },

  /**
   * Create a new chapter
   */
  async create(storyId: string, title: string, order: number, content: string = ''): Promise<Chapter> {
    if (isAuthenticated()) {
      return chaptersApi.create(storyId, title, order, content);
    } else {
      // Guest mode: create chapter in guest story
      const guestStory = guestDataManager.getStory();
      if (!guestStory || guestStory.id !== storyId) {
        throw new Error('Story not found');
      }
      const chapter = guestDataManager.createChapter(title, order);
      if (content) {
        guestDataManager.updateChapterContent(chapter.id, content);
      }
      return {
        id: chapter.id,
        storyId: chapter.storyId,
        title: chapter.title,
        content: content,
        order: chapter.order,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      };
    }
  },

  /**
   * Update chapter content
   */
  async updateContent(id: string, content: string): Promise<Chapter> {
    if (isAuthenticated()) {
      return chaptersApi.updateContent(id, content);
    } else {
      // Guest mode: update chapter in guest story
      guestDataManager.updateChapterContent(id, content);
      const chapter = guestDataManager.getChapter(id);
      if (!chapter) {
        throw new Error('Chapter not found');
      }
      return {
        id: chapter.id,
        storyId: chapter.storyId,
        title: chapter.title,
        content: chapter.content,
        order: chapter.order,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      };
    }
  },

  /**
   * Update chapter
   */
  async update(id: string, data: { title?: string }): Promise<Chapter> {
    if (isAuthenticated()) {
      return chaptersApi.update(id, data);
    } else {
      // Guest mode: update chapter title in guest story
      if (data.title) {
        guestDataManager.updateChapterTitle(id, data.title);
      }
      const chapter = guestDataManager.getChapter(id);
      if (!chapter) {
        throw new Error('Chapter not found');
      }
      return {
        id: chapter.id,
        storyId: chapter.storyId,
        title: chapter.title,
        content: chapter.content,
        order: chapter.order,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      };
    }
  },

  /**
   * Delete a chapter
   */
  async delete(id: string): Promise<void> {
    if (isAuthenticated()) {
      return chaptersApi.delete(id);
    } else {
      // Guest mode: delete chapter from guest story
      guestDataManager.deleteChapter(id);
    }
  },
};

/**
 * Lore Entries Service
 * Automatically switches between API and guest storage
 */
export const loreService = {
  /**
   * Get all lore entries for a story
   */
  async getAllForStory(storyId: string): Promise<LoreEntry[]> {
    if (isAuthenticated()) {
      return loreApi.getAllForStory(storyId);
    } else {
      // Guest mode: return lore entries from guest story
      const guestStory = guestDataManager.getStory();
      if (!guestStory || guestStory.id !== storyId) {
        return [];
      }
      return guestStory.loreEntries.map(entry => ({
        id: entry.id,
        storyId: entry.storyId,
        name: entry.name,
        type: entry.type,
        description: entry.description,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      }));
    }
  },

  /**
   * Create a new lore entry
   */
  async create(storyId: string, name: string, type: string, description: string): Promise<LoreEntry> {
    if (isAuthenticated()) {
      return loreApi.create(storyId, name, type, description);
    } else {
      // Guest mode: create lore entry in guest story
      const guestStory = guestDataManager.getStory();
      if (!guestStory || guestStory.id !== storyId) {
        throw new Error('Story not found');
      }
      const entry = guestDataManager.createLoreEntry(name, type, description);
      return {
        id: entry.id,
        storyId: entry.storyId,
        name: entry.name,
        type: entry.type,
        description: entry.description,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      };
    }
  },

  /**
   * Update a lore entry
   */
  async update(id: string, data: Partial<LoreEntry>): Promise<void> {
    if (isAuthenticated()) {
      return loreApi.update(id, data);
    } else {
      // Guest mode: update lore entry in guest story
      guestDataManager.updateLoreEntry(id, data);
    }
  },

  /**
   * Delete a lore entry
   */
  async delete(id: string): Promise<void> {
    if (isAuthenticated()) {
      return loreApi.delete(id);
    } else {
      // Guest mode: delete lore entry from guest story
      guestDataManager.deleteLoreEntry(id);
    }
  },
};
