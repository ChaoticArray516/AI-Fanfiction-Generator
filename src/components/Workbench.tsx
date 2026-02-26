/**
 * Workbench Component
 *
 * Main writing interface with three-panel layout:
 * - Left: Chapter & Lore navigator
 * - Center: Main editor
 * - Right: AI control panel
 *
 * Refactored to use global state management with nanostores
 */

import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  activeStoryStore,
  activeChapterStore,
  isWorkbenchLoadingStore,
  workbenchErrorStore,
  loadStoryForWorkbench,
  selectChapter,
  updateActiveChapterContent,
  addNewChapterToStory,
  type StoryWithDetails,
  type Chapter,
} from '../lib/stores';
import { chaptersApi } from '../lib/apiService';
import { AIGenerator } from './AIGenerator';

interface WorkbenchProps {
  storyId?: string;
  chapterId?: string;
}

export function Workbench({ storyId: propStoryId, chapterId: propChapterId }: WorkbenchProps) {
  // Subscribe to global stores
  const activeStory = useStore(activeStoryStore);
  const activeChapter = useStore(activeChapterStore);
  const isWorkbenchLoading = useStore(isWorkbenchLoadingStore);
  const workbenchError = useStore(workbenchErrorStore);

  // Local UI state only
  const [editorContent, setEditorContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Parse storyId and chapterId from URL if not provided as props
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStoryId = propStoryId || params.get('story');

    if (urlStoryId) {
      loadStoryForWorkbench(urlStoryId);
    }
  }, [propStoryId]);

  // Handle chapter selection via URL parameter
  useEffect(() => {
    if (activeStory && propChapterId) {
      selectChapter(propChapterId);
    }
  }, [propChapterId, activeStory]);

  // Sync editor content with active chapter
  useEffect(() => {
    if (activeChapter) {
      setEditorContent(activeChapter.content);
      setTempTitle(activeChapter.title);
    }
  }, [activeChapter]);

  // Auto-save effect with debounce
  useEffect(() => {
    if (!activeChapter || editorContent === activeChapter.content) return;

    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        await updateActiveChapterContent(editorContent);
      } catch (error) {
        console.error('Failed to save:', error);
      } finally {
        setSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [editorContent, activeChapter]);

  // Update word count
  useEffect(() => {
    const words = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [editorContent]);

  // Handle chapter title update
  const handleTitleUpdate = async () => {
    if (activeChapter && tempTitle !== activeChapter.title) {
      try {
        await chaptersApi.update(activeChapter.id, { title: tempTitle });
        // Reload story to get updated chapter data
        if (activeStory) {
          await loadStoryForWorkbench(activeStory.story.id);
        }
      } catch (error) {
        console.error('Failed to update title:', error);
        // Revert to original title on error
        setTempTitle(activeChapter.title);
      }
    }
    setEditingTitle(false);
  };

  // Handle AI text generation
  const handleAITextGenerated = (generatedText: string) => {
    if (!activeChapter) return;

    // Append generated text to current content
    const newContent = editorContent + (editorContent && !editorContent.endsWith('\n') ? '\n\n' : '') + generatedText;
    setEditorContent(newContent);

    // Auto-save will be triggered by the editorContent change
  };

  // Loading state
  if (isWorkbenchLoading) {
    return (
      <div className="min-h-screen bg-[#12101D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8A2BE2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#A09CB8]">Loading your story...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (workbenchError) {
    return (
      <div className="min-h-screen bg-[#12101D] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#EAE6F8] mb-4">Error</h2>
          <p className="text-[#A09CB8] mb-6">{workbenchError}</p>
          <a href="/dashboard" className="btn-primary px-6 py-3 rounded-lg inline-block">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // No story state
  if (!activeStory) {
    return (
      <div className="min-h-screen bg-[#12101D] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#EAE6F8] mb-4">Story not found</h2>
          <a href="/dashboard" className="btn-primary px-6 py-3 rounded-lg inline-block">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#12101D] flex">
      {/* LEFT PANEL - Navigator */}
      <aside className="w-[240px] flex-shrink-0 border-r border-[#3A3651] flex flex-col bg-[#12101D]">
        {/* Story Title */}
        <div className="h-14 flex items-center px-5 border-b border-[#3A3651]">
          <h1 className="font-bold text-lg truncate" title={activeStory.story.title}>
            {activeStory.story.title}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">
          {/* Chapters Section */}
          <div className="px-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-xs font-bold text-[#A09CB8] uppercase tracking-wider">
                Chapters
              </h2>
            </div>
            <ul className="flex flex-col gap-0.5">
              {activeStory.chapters.map((chapter) => (
                <li key={chapter.id}>
                  <button
                    onClick={() => selectChapter(chapter.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-r-md transition-colors ${
                      activeChapter?.id === chapter.id
                        ? 'bg-gradient-to-r from-[rgba(138,43,226,0.1)] text-[#EAE6F8] font-medium'
                        : 'text-[#A09CB8] hover:text-[#EAE6F8] hover:bg-[rgba(255,255,255,0.03)]'
                    }`}
                  >
                    {chapter.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Lorebook Section */}
          <div className="px-3">
            <div className="flex items-center justify-between px-2 mb-3">
              <h2 className="text-xs font-bold text-[#A09CB8] uppercase tracking-wider">
                Lorebook
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 px-2">
              {activeStory.loreEntries.length > 0 ? (
                activeStory.loreEntries.map((entry) => (
                  <span
                    key={entry.id}
                    className="bg-[rgba(28,25,41,0.8)] border border-[#3A3651] rounded-full px-2.5 py-1 text-xs font-medium text-[#A09CB8]"
                  >
                    {entry.name}
                  </span>
                ))
              ) : (
                <p className="text-xs text-[#A09CB8] px-2">No entries yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Add Chapter Button */}
        <div className="p-4 border-t border-[#3A3651]">
          <button
            onClick={() => addNewChapterToStory(`Chapter ${activeStory.chapters.length + 1}`)}
            className="w-full flex items-center gap-2 text-sm font-medium text-[#A09CB8] hover:text-[#EAE6F8] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Chapter
          </button>
        </div>
      </aside>

      {/* CENTER PANEL - Editor */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#12101D]">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-8 z-10">
          {editingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTitleUpdate();
                } else if (e.key === 'Escape') {
                  setTempTitle(activeChapter?.title || '');
                  setEditingTitle(false);
                }
              }}
              autoFocus
              className="bg-[rgba(28,25,41,0.5)] border border-[#8A2BE2] rounded-lg px-3 py-1 text-lg font-bold text-[#EAE6F8] outline-none w-1/2"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-lg font-bold text-[#A09CB8] hover:text-[#EAE6F8] transition-colors w-1/2 text-left"
            >
              {activeChapter?.title || 'Untitled'}
            </button>
          )}
          <div className="text-xs font-medium text-[#A09CB8] bg-[rgba(28,25,41,0.5)] px-3 py-1 rounded-full border border-[#3A3651] flex items-center gap-2">
            <span>{wordCount.toLocaleString()} words</span>
            {saving && (
              <>
                <span>•</span>
                <span>Saving...</span>
              </>
            )}
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto px-8 md:px-16 lg:px-24 xl:px-32 py-10 pb-32">
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            className="w-full min-h-full bg-transparent border-none outline-none text-lg leading-relaxed text-[#EAE6F8] resize-none"
            placeholder="Start writing your story..."
            style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', lineHeight: '1.7' }}
          />
        </div>
      </main>

      {/* RIGHT PANEL - AI Control Panel */}
      <aside className="w-[320px] flex-shrink-0 border-l border-[#3A3651] flex flex-col bg-[#12101D]">
        <div className="flex-1 overflow-y-auto p-5">
          <AIGenerator
            onTextGenerated={handleAITextGenerated}
            initialText={activeChapter?.content || ''}
            lorebook={activeStory.loreEntries.map(entry => ({
              type: entry.type,
              name: entry.name,
              description: entry.description,
            }))}
          />
        </div>
      </aside>
    </div>
  );
}
