/**
 * Dashboard Component
 *
 * Main dashboard displaying all stories with actions to create, open, and delete
 */

import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { storiesStore, isLoadingStore, errorStore, loadStories, addNewStory, deleteStory, clearError } from '../lib/stores';
import { StoryCard } from './StoryCard';
import type { Story } from '../lib/db';

export function Dashboard() {
  const stories = useStore(storiesStore);
  const isLoading = useStore(isLoadingStore);
  const error = useStore(errorStore);
  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');

  // Load stories on mount
  useEffect(() => {
    loadStories();
  }, []);

  // Handle creating a new story
  const handleAddStory = async () => {
    if (!newStoryTitle.trim()) return;

    try {
      await addNewStory(newStoryTitle.trim());
      setNewStoryTitle('');
      setShowNewStoryModal(false);
    } catch (error) {
      console.error('Failed to add story:', error);
    }
  };

  // Handle opening a story
  const handleOpenStory = (storyId: string) => {
    // Find the first chapter or redirect to create one
    const story = stories.find(s => s.id === storyId);
    if (story) {
      // For now, redirect to dashboard with a note to add chapters
      // In the future, we could redirect to the workbench with a new chapter
      window.location.href = `/workbench/${storyId}/new`;
    }
  };

  // Handle deleting a story
  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory(storyId);
    } catch (error) {
      console.error('Failed to delete story:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#12101D]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Stories</h1>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-sm font-medium text-[#A09CB8] hover:text-[#EAE6F8] hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#8A2BE2] hover:to-[#4A00E0] transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m4 4V4" />
            </svg>
            Back to Home
          </a>
          <button
            onClick={() => setShowNewStoryModal(true)}
            className="btn-primary px-5 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Story
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-[#E05A5A]/20 border border-[#E05A5A] rounded-lg p-4 flex items-center justify-between">
            <span className="text-[#EAE6F8] text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-[#E05A5A] hover:text-[#ffb4b4] text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-6 mt-12 text-center">
          <div className="inline-flex items-center gap-3 text-[#A09CB8]">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Loading stories...
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && stories.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-12">
          <div className="text-center py-20">
            <svg className="w-16 h-16 mx-auto text-[#A09CB8] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332-.477 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332-.477-4.5-1.253" />
            </svg>
            <h2 className="text-2xl font-bold text-[#EAE6F8] mb-2">Your story awaits</h2>
            <p className="text-[#A09CB8] mb-6">Start your first chapter and begin your journey</p>
            <button
              onClick={() => setShowNewStoryModal(true)}
              className="btn-primary px-8 py-3 rounded-lg text-lg"
            >
              Create Your First Story
            </button>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      {!isLoading && stories.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onOpen={handleOpenStory}
                onDelete={handleDeleteStory}
              />
            ))}
          </div>
        </div>
      )}

      {/* New Story Modal */}
      {showNewStoryModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewStoryModal(false)}
        >
          <div
            className="glass-panel p-6 rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[#EAE6F8] mb-4">Create New Story</h2>
            <input
              type="text"
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStory()}
              placeholder="Enter story title..."
              className="w-full bg-[rgba(18,16,29,0.6)] border border-[#3A3651] rounded-lg px-4 py-3 text-[#EAE6F8] placeholder:text-[#3A3651] focus:outline-none focus:border-[#8A2BE2] mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowNewStoryModal(false)}
                className="btn-secondary px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStory}
                disabled={!newStoryTitle.trim()}
                className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
