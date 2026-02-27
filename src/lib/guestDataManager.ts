/**
 * Guest Data Manager
 *
 * Manages story data for non-authenticated users using localStorage
 * This allows users to try the app without signing up
 */

interface GuestStory {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  chapters: GuestChapter[];
  loreEntries: GuestLoreEntry[];
}

interface GuestChapter {
  id: string;
  storyId: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface GuestLoreEntry {
  id: string;
  storyId: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const GUEST_STORAGE_KEY = 'guest_story';

/**
 * Guest Data Manager
 * Handles all data operations for non-authenticated users
 */
export const guestDataManager = {
  /**
   * Check if guest data exists
   */
  hasData(): boolean {
    return !!localStorage.getItem(GUEST_STORAGE_KEY);
  },

  /**
   * Get the guest story
   */
  getStory(): GuestStory | null {
    try {
      const data = localStorage.getItem(GUEST_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading guest story:', error);
      return null;
    }
  },

  /**
   * Save the guest story
   */
  saveStory(story: GuestStory): void {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(story));
    } catch (error) {
      console.error('Error saving guest story:', error);
      throw new Error('Failed to save story. Storage might be full.');
    }
  },

  /**
   * Update the guest story title
   */
  updateTitle(title: string): void {
    const story = this.getStory();
    if (story) {
      story.title = title;
      story.updatedAt = new Date().toISOString();
      this.saveStory(story);
    }
  },

  /**
   * Get all chapters
   */
  getChapters(): GuestChapter[] {
    const story = this.getStory();
    return story?.chapters || [];
  },

  /**
   * Get a single chapter by ID
   */
  getChapter(id: string): GuestChapter | null {
    const story = this.getStory();
    return story?.chapters.find(ch => ch.id === id) || null;
  },

  /**
   * Create a new chapter
   */
  createChapter(title: string, order: number): GuestChapter {
    const story = this.getStory();
    if (!story) {
      throw new Error('No guest story found');
    }

    const newChapter: GuestChapter = {
      id: `guest_ch_${Date.now()}`,
      storyId: story.id,
      title,
      content: '',
      order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    story.chapters.push(newChapter);
    story.updatedAt = new Date().toISOString();
    this.saveStory(story);

    return newChapter;
  },

  /**
   * Update chapter content
   */
  updateChapterContent(id: string, content: string): void {
    const story = this.getStory();
    if (!story) return;

    const chapter = story.chapters.find(ch => ch.id === id);
    if (chapter) {
      chapter.content = content;
      chapter.updatedAt = new Date().toISOString();
      story.updatedAt = new Date().toISOString();
      this.saveStory(story);
    }
  },

  /**
   * Update chapter title
   */
  updateChapterTitle(id: string, title: string): void {
    const story = this.getStory();
    if (!story) return;

    const chapter = story.chapters.find(ch => ch.id === id);
    if (chapter) {
      chapter.title = title;
      chapter.updatedAt = new Date().toISOString();
      story.updatedAt = new Date().toISOString();
      this.saveStory(story);
    }
  },

  /**
   * Delete a chapter
   */
  deleteChapter(id: string): void {
    const story = this.getStory();
    if (!story) return;

    const chapterIndex = story.chapters.findIndex(ch => ch.id === id);
    if (chapterIndex !== -1) {
      story.chapters.splice(chapterIndex, 1);
      story.updatedAt = new Date().toISOString();
      this.saveStory(story);
    }
  },

  /**
   * Get all lore entries
   */
  getLoreEntries(): GuestLoreEntry[] {
    const story = this.getStory();
    return story?.loreEntries || [];
  },

  /**
   * Create a lore entry
   */
  createLoreEntry(name: string, type: string, description: string): GuestLoreEntry {
    const story = this.getStory();
    if (!story) {
      throw new Error('No guest story found');
    }

    const newEntry: GuestLoreEntry = {
      id: `guest_lore_${Date.now()}`,
      storyId: story.id,
      name,
      type,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    story.loreEntries.push(newEntry);
    story.updatedAt = new Date().toISOString();
    this.saveStory(story);

    return newEntry;
  },

  /**
   * Update a lore entry
   */
  updateLoreEntry(id: string, data: { name?: string; type?: string; description?: string }): void {
    const story = this.getStory();
    if (!story) return;

    const entry = story.loreEntries.find(e => e.id === id);
    if (entry) {
      // Update only the fields provided in data
      if (data.name !== undefined) entry.name = data.name;
      if (data.type !== undefined) entry.type = data.type;
      if (data.description !== undefined) entry.description = data.description;
      entry.updatedAt = new Date().toISOString();
      story.updatedAt = new Date().toISOString();
      this.saveStory(story);
    }
  },

  /**
   * Delete a lore entry
   */
  deleteLoreEntry(id: string): void {
    const story = this.getStory();
    if (!story) return;

    const entryIndex = story.loreEntries.findIndex(e => e.id === id);
    if (entryIndex !== -1) {
      story.loreEntries.splice(entryIndex, 1);
      story.updatedAt = new Date().toISOString();
      this.saveStory(story);
    }
  },

  /**
   * Initialize a new guest story
   */
  initializeStory(title: string = 'Untitled Story'): GuestStory {
    const story: GuestStory = {
      id: `guest_story_${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chapters: [],
      loreEntries: [],
    };

    this.saveStory(story);
    return story;
  },

  /**
   * Clear all guest data
   */
  clearData(): void {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  },

  /**
   * Get the complete story data for migration
   */
  getDataForMigration(): GuestStory | null {
    return this.getStory();
  },

  /**
   * Get or create guest story
   * Returns the existing guest story or creates a new one if none exists
   */
  getOrCreateGuestStory(): GuestStory {
    const story = this.getStory();
    if (story) {
      return story;
    }
    return this.initializeStory();
  },
};
