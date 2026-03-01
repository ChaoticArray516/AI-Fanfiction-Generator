/**
 * Global State Management for AI Fanfiction Generator
 *
 * This module uses Nanostores to manage application state.
 * Stores are reactive and can be subscribed to from React components using the useStore hook.
 */

import { atom } from 'nanostores';
import { storiesService, chaptersService, loreService, isAuthenticated } from './dataService';

// ============================================
// Type Definitions
// ============================================

// Story type (matching the backend schema)
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
 * Story with all related data
 * Used in the workbench to display the complete story
 */
export interface StoryWithDetails {
  story: Story;
  chapters: Chapter[];
  loreEntries: LoreEntry[];
}

// ============================================
// Stories Store (Dashboard)
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
// Workbench Store (Active Story)
// ============================================

/**
 * Active story atom - holds the complete story object with chapters and lore
 * Used in the workbench to display and edit the current story
 */
export const activeStoryStore = atom<StoryWithDetails | null>(null);

/**
 * Active chapter atom - holds the currently editing chapter
 */
export const activeChapterStore = atom<Chapter | null>(null);

/**
 * Workbench loading state atom - tracks if workbench data is being loaded
 */
export const isWorkbenchLoadingStore = atom<boolean>(false);

/**
 * Workbench error state atom - holds any workbench-specific error messages
 */
export const workbenchErrorStore = atom<string | null>(null);

// ============================================
// Store Actions - Dashboard
// ============================================

/**
 * Load all stories from the database and update the store
 * Stories are sorted by updatedAt descending (most recent first)
 */
export async function loadStories(): Promise<void> {
  try {
    isLoadingStore.set(true);
    errorStore.set(null);

    const stories = await storiesService.getAll();

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
    const newStory = await storiesService.create(title);

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

    await storiesService.update(story.id, { title: story.title });

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

    await storiesService.delete(id);

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
// Store Actions - Workbench
// ============================================

/**
 * Load a story with all its details (chapters and lore) into the workbench
 * This is the core function for preparing the workbench with story data
 *
 * @param storyId - The ID of the story to load
 */
export async function loadStoryForWorkbench(storyId: string): Promise<void> {
  try {
    isWorkbenchLoadingStore.set(true);
    workbenchErrorStore.set(null);

    // Parallel fetch: story details, chapters, and lore entries
    const [story, chapters, loreEntries] = await Promise.all([
      storiesService.getById(storyId),
      chaptersService.getAllForStory(storyId),
      loreService.getAllForStory(storyId),
    ]);

    // Combine into StoryWithDetails object
    const storyWithDetails: StoryWithDetails = {
      story,
      chapters: chapters.sort((a, b) => a.order - b.order), // Sort by order
      loreEntries,
    };

    // Update the active story store
    activeStoryStore.set(storyWithDetails);

    // Set the first chapter as active if available
    if (chapters.length > 0) {
      const firstChapter = chapters.sort((a, b) => a.order - b.order)[0];
      activeChapterStore.set(firstChapter);
    } else {
      // No chapters exist - for guest users, auto-create the first chapter
      if (!isAuthenticated()) {
        await addNewChapterToStory('Chapter 1');
      } else {
        activeChapterStore.set(null);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    workbenchErrorStore.set(`Failed to load story: ${errorMessage}`);
    console.error('Error loading story for workbench:', error);
  } finally {
    isWorkbenchLoadingStore.set(false);
  }
}

/**
 * Select a chapter to edit in the workbench
 *
 * @param chapterId - The ID of the chapter to select
 */
export function selectChapter(chapterId: string): void {
  const activeStory = activeStoryStore.get();

  if (!activeStory) {
    console.error('No active story found');
    return;
  }

  const chapter = activeStory.chapters.find((ch) => ch.id === chapterId);

  if (!chapter) {
    console.error(`Chapter ${chapterId} not found in active story`);
    return;
  }

  activeChapterStore.set(chapter);
}

/**
 * Update the content of the currently active chapter
 * This will persist the changes to the backend via API
 *
 * @param content - The new content for the chapter
 */
export async function updateActiveChapterContent(content: string): Promise<void> {
  const activeChapter = activeChapterStore.get();

  if (!activeChapter) {
    console.error('No active chapter to update');
    return;
  }

  try {
    workbenchErrorStore.set(null);

    // Update via API
    const updatedChapter = await chaptersService.updateContent(activeChapter.id, content);

    // Update the active chapter store
    activeChapterStore.set(updatedChapter);

    // Also update the chapter in the active story store
    const activeStory = activeStoryStore.get();
    if (activeStory) {
      const updatedChapters = activeStory.chapters.map((ch) =>
        ch.id === updatedChapter.id ? updatedChapter : ch
      );
      activeStoryStore.set({
        ...activeStory,
        chapters: updatedChapters,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    workbenchErrorStore.set(`Failed to update chapter: ${errorMessage}`);
    console.error('Error updating chapter content:', error);
    throw error;
  }
}

/**
 * Add a new chapter to the current story
 * After creation, the story data is reloaded to ensure consistency
 *
 * @param title - The title of the new chapter
 */
export async function addNewChapterToStory(title: string): Promise<void> {
  const activeStory = activeStoryStore.get();

  if (!activeStory) {
    console.error('No active story found');
    return;
  }

  try {
    workbenchErrorStore.set(null);

    // Calculate the next order number
    const nextOrder = activeStory.chapters.length > 0
      ? Math.max(...activeStory.chapters.map(ch => ch.order)) + 1
      : 1;

    // Create new chapter via API
    await chaptersService.create(activeStory.story.id, title, nextOrder, '');

    // Reload the entire story to ensure state consistency
    await loadStoryForWorkbench(activeStory.story.id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    workbenchErrorStore.set(`Failed to add chapter: ${errorMessage}`);
    console.error('Error adding new chapter:', error);
    throw error;
  }
}

// ============================================
// Utility Functions - Dashboard
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

// ============================================
// Utility Functions - Workbench
// ============================================

/**
 * Get the current active story with details
 */
export function getActiveStory(): StoryWithDetails | null {
  return activeStoryStore.get();
}

/**
 * Get the current active chapter
 */
export function getActiveChapter(): Chapter | null {
  return activeChapterStore.get();
}

/**
 * Check if workbench data is currently being loaded
 */
export function isWorkbenchLoading(): boolean {
  return isWorkbenchLoadingStore.get();
}

/**
 * Get the current workbench error message
 */
export function getWorkbenchError(): string | null {
  return workbenchErrorStore.get();
}

/**
 * Clear the workbench error state
 */
export function clearWorkbenchError(): void {
  workbenchErrorStore.set(null);
}

/**
 * Clear all workbench state (useful when logging out or switching stories)
 */
export function clearWorkbenchState(): void {
  activeStoryStore.set(null);
  activeChapterStore.set(null);
  workbenchErrorStore.set(null);
}
