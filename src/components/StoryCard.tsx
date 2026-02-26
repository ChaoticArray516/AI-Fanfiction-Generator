/**
 * StoryCard Component
 *
 * Displays a single story card with title, dates, and action buttons
 */

import type { Story } from '../lib/db.ts';

interface StoryCardProps {
  story: Story;
  onOpen: (storyId: string) => void;
  onDelete: (storyId: string) => void;
}

export function StoryCard({ story, onOpen, onDelete }: StoryCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="glass-card p-0 group cursor-pointer" onClick={() => onOpen(story.id)}>
      {/* Cover Image Area */}
      <div className="relative h-40 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center overflow-hidden">
        {/* Title Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <h3 className="text-xl font-bold text-center text-white drop-shadow-lg line-clamp-2">
            {story.title}
          </h3>
        </div>

        {/* Kebab Menu */}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${story.title}"?`)) {
              onDelete(story.id);
            }
          }}
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Story Info */}
      <div className="p-4">
        <h4 className="font-bold text-[#EAE6F8] mb-2 truncate">{story.title}</h4>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[#A09CB8] mb-3">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>1 chapter</span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#A09CB8]">
            Last edited {formatDate(story.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
