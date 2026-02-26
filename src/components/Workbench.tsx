/**
 * Workbench Component
 *
 * Main writing interface with three-panel layout:
 * - Left: Chapter & Lore navigator
 * - Center: Main editor
 * - Right: AI control panel
 */

import { useState, useEffect } from 'react';
import { storiesApi, chaptersApi, loreApi } from '../lib/apiService';
import { guestDataManager } from '../lib/guestDataManager';
import { useAuthSession } from '../contexts/SessionContext';
import type { Story } from '../lib/stores';

// Define types based on API service
interface Chapter {
  id: string;
  storyId: string;
  title: string;
  content: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface LoreEntry {
  id: string;
  storyId: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkbenchProps {
  storyId?: string;
  chapterId?: string;
}

export function Workbench({ storyId: propStoryId, chapterId: propChapterId }: WorkbenchProps) {
  // Get user session
  const { user, isAuthenticated } = useAuthSession();

  // Data state
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

  // UI state
  const [editorContent, setEditorContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Check if using guest mode
  const isGuestMode = !isAuthenticated;

  // Parse storyId and chapterId from URL if not provided as props
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlStoryId = propStoryId || params.get('story');
    const urlChapterId = propChapterId || params.get('chapter');

    if (urlStoryId && isAuthenticated) {
      loadStoryData(urlStoryId, urlChapterId);
    } else if (isGuestMode) {
      loadGuestStoryData();
    }
  }, [propStoryId, propChapterId, isAuthenticated, isGuestMode]);

  // Load story data (authenticated user)
  async function loadStoryData(sid: string, cid?: string | null) {
    try {
      // Load story
      const storyData = await storiesApi.getById(sid);
      if (!storyData) {
        console.error('Story not found');
        return;
      }
      setStory(storyData);

      // Load chapters
      const chaptersData = await chaptersApi.getAllForStory(sid);
      setChapters(chaptersData);

      // Load lore entries
      const loreData = await loreApi.getAllForStory(sid);
      setLoreEntries(loreData);

      // Set current chapter
      if (cid) {
        const chapter = chaptersData.find(ch => ch.id === cid);
        if (chapter) {
          setCurrentChapter(chapter);
          setEditorContent(chapter.content);
        }
      } else if (chaptersData.length > 0) {
        // Default to first chapter if none specified
        setCurrentChapter(chaptersData[0]);
        setEditorContent(chaptersData[0].content);
      } else {
        // Create first chapter if story has none
        const newChapter = await chaptersApi.create(sid, 'Chapter 1', 1, '');
        const updatedChapters = await chaptersApi.getAllForStory(sid);
        setChapters(updatedChapters);
        setCurrentChapter(newChapter);
        setEditorContent('');
      }
    } catch (error) {
      console.error('Failed to load story:', error);
    }
  }

  // Load guest story data (non-authenticated user)
  function loadGuestStoryData() {
    try {
      let guestStory = guestDataManager.getStory();

      // Initialize guest story if none exists
      if (!guestStory) {
        guestStory = guestDataManager.initializeStory('My Story');
      }

      // Set story (fake a story object)
      setStory({
        id: guestStory.id,
        userId: 'guest',
        title: guestStory.title,
        createdAt: guestStory.createdAt,
        updatedAt: guestStory.updatedAt,
      } as Story);

      // Set chapters
      setChapters(guestStory.chapters);

      // Set lore entries
      setLoreEntries(guestStory.loreEntries);

      // Set current chapter
      if (guestStory.chapters.length > 0) {
        setCurrentChapter(guestStory.chapters[0]);
        setEditorContent(guestStory.chapters[0].content);
      }

      // Show upgrade prompt after 30 seconds
      setTimeout(() => {
        setShowUpgradePrompt(true);
      }, 30000);
    } catch (error) {
      console.error('Failed to load guest story:', error);
    }
  }

  // Handle chapter change
  async function handleChapterSelect(chapterId: string) {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      // Save current chapter first
      if (currentChapter && editorContent !== currentChapter.content) {
        if (isAuthenticated) {
          await chaptersApi.updateContent(currentChapter.id, editorContent);
        } else {
          guestDataManager.updateChapterContent(currentChapter.id, editorContent);
        }
      }

      // Switch to new chapter
      setCurrentChapter(chapter);
      setEditorContent(chapter.content);

      // Update URL without page reload (only for authenticated users)
      if (isAuthenticated && story) {
        const url = new URL(window.location.href);
        url.searchParams.set('chapter', chapterId);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }

  // Auto-save effect
  useEffect(() => {
    if (!currentChapter) return;

    const timeoutId = setTimeout(async () => {
      if (editorContent !== currentChapter.content) {
        setSaving(true);
        try {
          if (isAuthenticated) {
            await chaptersApi.updateContent(currentChapter.id, editorContent);
            // Update chapter in state
            setCurrentChapter({
              ...currentChapter,
              content: editorContent,
              updatedAt: new Date().toISOString(),
            });
          } else {
            guestDataManager.updateChapterContent(currentChapter.id, editorContent);
            // Update chapter in state
            setCurrentChapter({
              ...currentChapter,
              content: editorContent,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Failed to save:', error);
        } finally {
          setSaving(false);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [editorContent, currentChapter, isAuthenticated]);

  // Update word count
  useEffect(() => {
    const words = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [editorContent]);

  // Add new chapter
  async function handleAddChapter() {
    if (!story) return;

    if (isAuthenticated) {
      const newChapter = await chaptersApi.create(story.id, `Chapter ${chapters.length + 1}`, chapters.length + 1, '');
      const updatedChapters = await chaptersApi.getAllForStory(story.id);
      setChapters(updatedChapters);
      setCurrentChapter(newChapter);
      setEditorContent('');
    } else {
      const newChapter = guestDataManager.createChapter(`Chapter ${chapters.length + 1}`, chapters.length + 1);
      const guestStory = guestDataManager.getStory();
      if (guestStory) {
        setChapters(guestStory.chapters);
      }
      setCurrentChapter(newChapter);
      setEditorContent('');
    }
  }

  if (!story) {
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
          <h1 className="font-bold text-lg truncate" title={story.title}>{story.title}</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6">
          {/* Chapters Section */}
          <div className="px-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-xs font-bold text-[#A09CB8] uppercase tracking-wider">Chapters</h2>
            </div>
            <ul className="flex flex-col gap-0.5">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <button
                    onClick={() => handleChapterSelect(chapter.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-r-md transition-colors ${
                      currentChapter?.id === chapter.id
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
              <h2 className="text-xs font-bold text-[#A09CB8] uppercase tracking-wider">Lorebook</h2>
            </div>
            <div className="flex flex-wrap gap-2 px-2">
              {loreEntries.length > 0 ? (
                loreEntries.map((entry) => (
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
            onClick={handleAddChapter}
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
        {/* Guest Mode Upgrade Banner */}
        {showUpgradePrompt && isGuestMode && (
          <div className="bg-gradient-to-r from-[rgba(138,43,226,0.2)] to-[rgba(74,0,224,0.2)] border-b border-[#8A2BE2] px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#8A2BE2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm text-[#EAE6F8]">Your work is saved locally. Sign up to save it permanently!</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="text-sm text-[#A09CB8] hover:text-[#EAE6F8] transition-colors"
              >
                Dismiss
              </button>
              <a
                href="/signup"
                className="btn-primary px-4 py-1.5 rounded-lg text-sm font-medium"
              >
                Sign Up Free
              </a>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-8 z-10">
          <input
            type="text"
            value={currentChapter?.title || ''}
            onChange={(e) => {
              if (currentChapter) {
                setCurrentChapter({ ...currentChapter, title: e.target.value });
              }
            }}
            onBlur={async () => {
              if (currentChapter) {
                if (isAuthenticated) {
                  await chaptersApi.update(currentChapter.id, { title: currentChapter.title });
                } else {
                  guestDataManager.updateChapterTitle(currentChapter.id, currentChapter.title);
                  // Refresh chapters to get updated data
                  const guestStory = guestDataManager.getStory();
                  if (guestStory) {
                    setChapters(guestStory.chapters);
                  }
                }
              }
            }}
            className="bg-transparent border-none outline-none text-lg font-bold text-[#A09CB8] hover:text-[#EAE6F8] focus:text-[#EAE6F8] transition-colors w-1/2"
          />
          <div className="text-xs font-medium text-[#A09CB8] bg-[rgba(28,25,41,0.5)] px-3 py-1 rounded-full border border-[#3A3651] flex items-center gap-2">
            <span>{wordCount.toLocaleString()} words</span>
            {saving && (
              <>
                <span>•</span>
                <span>Saving...</span>
              </>
            )}
            {isGuestMode && (
              <>
                <span>•</span>
                <span className="text-[#8A2BE2]">Guest Mode</span>
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
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Placeholder for AI Generator */}
          <div className="glass-panel p-6 rounded-xl text-center">
            <p className="text-[#A09CB8] text-sm mb-4">AI Assistant</p>
            <p className="text-xs text-[#3A3651]">AI generation features will be integrated here.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
