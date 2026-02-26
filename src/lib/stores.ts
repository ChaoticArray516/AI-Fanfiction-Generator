/**
 * Global State Management for AI Fanfiction Generator
 *
 * This module uses Nanostores to manage application state.
 * Stores are reactive and can be subscribed to from React components using the useStore hook.
 */

import { atom } from 'nanostores';
import { storiesApi } from './apiService';

// Story type (matching the backend schema)
export interface Story {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Stories Store
// ============================================

/**
 * Stories atom - holds an array of all stories
 * Initialized as empty array, will be populated by loadStories()
 */
export const storiesStore = atom<Story[]>([]);

/**
 * Loading state atom - tracks if data is being loaded
 */
export const isLoadingStore = atom<boolean>(false);

/**
 * Error state atom - holds any error messages
 */
export const errorStore = atom<string | null>(null);

// ============================================
// Store Actions
// ============================================

/**
 * Load all stories from the database and update the store
 * Stories are sorted by updatedAt descending (most recent first)
 */
export async function loadStories(): Promise<void> {
  try {
    isLoadingStore.set(true);
    errorStore.set(null);

    const stories = await storiesApi.getAll();

    // Sort by updatedAt descending
    const sortedStories = stories.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    storiesStore.set(sortedStories);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errorStore.set(`Failed to load stories: ${errorMessage}`);
    console.error('Error loading stories:', error);
  } finally {
    isLoadingStore.set(false);
  }
}

/**
 * Add a new story to the database and refresh the store
 * @param title - The title of the new story
 * @returns The newly created story object
 */
export async function addNewStory(title: string): Promise<Story> {
  try {
    errorStore.set(null);

    // Add story to database
    const newStory = await storiesApi.create(title);

    // Refresh the store with updated data
    await loadStories();

    return newStory;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errorStore.set(`Failed to add story: ${errorMessage}`);
    console.error('Error adding story:', error);
    throw error;
  }
}

/**
 * Update an existing story
 * @param story - The story object with updated fields
 */
export async function updateStory(story: Story): Promise<void> {
  try {
    errorStore.set(null);

    await storiesApi.update(story.id, { title: story.title });

    // Refresh the store
    await loadStories();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errorStore.set(`Failed to update story: ${errorMessage}`);
    console.error('Error updating story:', error);
    throw error;
  }
}

/**
 * Delete a story and refresh the store
 * @param id - The ID of the story to delete
 */
export async function deleteStory(id: string): Promise<void> {
  try {
    errorStore.set(null);

    await storiesApi.delete(id);

    // Refresh the store
    await loadStories();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errorStore.set(`Failed to delete story: ${errorMessage}`);
    console.error('Error deleting story:', error);
    throw error;
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get the current stories value synchronously
 * Note: In React components, use the useStore hook instead
 */
export function getStories(): Story[] {
  return storiesStore.get();
}

/**
 * Check if stories are currently being loaded
 */
export function isLoading(): boolean {
  return isLoadingStore.get();
}

/**
 * Get the current error message
 */
export function getError(): string | null {
  return errorStore.get();
}

/**
 * Clear the error state
 */
export function clearError(): void {
  errorStore.set(null);
}
