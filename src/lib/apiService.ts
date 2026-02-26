/**
 * API Service
 *
 * Client-side service for making API calls to the backend
 */

export interface Story {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoreEntry {
  id: string;
  storyId: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stories API
 */
export const storiesApi = {
  /**
   * Get all stories for the current user
   */
  async getAll(): Promise<Story[]> {
    const response = await fetch('/api/stories');
    if (!response.ok) {
      throw new Error('Failed to fetch stories');
    }
    return response.json();
  },

  /**
   * Get a single story by ID
   */
  async getById(id: string): Promise<Story> {
    const response = await fetch(`/api/stories/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch story');
    }
    return response.json();
  },

  /**
   * Create a new story
   */
  async create(title: string): Promise<Story> {
    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      throw new Error('Failed to create story');
    }
    return response.json();
  },

  /**
   * Update a story
   */
  async update(id: string, data: { title?: string }): Promise<Story> {
    const response = await fetch(`/api/stories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update story');
    }
    return response.json();
  },

  /**
   * Delete a story
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/stories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete story');
    }
  },
};

/**
 * Chapters API
 */
export const chaptersApi = {
  /**
   * Get all chapters for a story
   */
  async getAllForStory(storyId: string): Promise<Chapter[]> {
    const response = await fetch(`/api/stories/${storyId}/chapters`);
    if (!response.ok) {
      throw new Error('Failed to fetch chapters');
    }
    return response.json();
  },

  /**
   * Get a single chapter by ID
   */
  async getById(id: string): Promise<Chapter> {
    const response = await fetch(`/api/chapters/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chapter');
    }
    return response.json();
  },

  /**
   * Create a new chapter
   */
  async create(storyId: string, title: string, order: number, content: string = ''): Promise<Chapter> {
    const response = await fetch(`/api/stories/${storyId}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, order, content }),
    });
    if (!response.ok) {
      throw new Error('Failed to create chapter');
    }
    return response.json();
  },

  /**
   * Update chapter content
   */
  async updateContent(id: string, content: string): Promise<Chapter> {
    const response = await fetch(`/api/chapters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      throw new Error('Failed to update chapter');
    }
    return response.json();
  },

  /**
   * Update chapter
   */
  async update(id: string, data: { title?: string }): Promise<Chapter> {
    const response = await fetch(`/api/chapters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update chapter');
    }
    return response.json();
  },

  /**
   * Delete a chapter
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/chapters/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete chapter');
    }
  },
};

/**
 * Lore Entries API
 */
export const loreApi = {
  /**
   * Get all lore entries for a story
   */
  async getAllForStory(storyId: string): Promise<LoreEntry[]> {
    const response = await fetch(`/api/stories/${storyId}/lore`);
    if (!response.ok) {
      throw new Error('Failed to fetch lore entries');
    }
    return response.json();
  },

  /**
   * Create a new lore entry
   */
  async create(storyId: string, name: string, type: string, description: string): Promise<LoreEntry> {
    const response = await fetch(`/api/stories/${storyId}/lore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, description }),
    });
    if (!response.ok) {
      throw new Error('Failed to create lore entry');
    }
    return response.json();
  },

  /**
   * Update a lore entry
   */
  async update(id: string, data: Partial<LoreEntry>): Promise<void> {
    const response = await fetch(`/api/lore/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update lore entry');
    }
  },

  /**
   * Delete a lore entry
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/lore/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete lore entry');
    }
  },
};
