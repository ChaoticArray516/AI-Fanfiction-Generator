/**
 * Drizzle Database Schema
 *
 * Defines the database tables for stories, chapters, and lore entries
 */

import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Stories table
 * Represents a fanfiction story created by a user
 */
export const stories = pgTable('stories', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // Reference to Better Auth user
  title: text('title').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Chapters table
 * Represents chapters within a story
 */
export const chapters = pgTable('chapters', {
  id: text('id').primaryKey(),
  storyId: text('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Lore entries table
 * Represents lorebook entries for a story
 */
export const loreEntries = pgTable('lore_entries', {
  id: text('id').primaryKey(),
  storyId: text('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull().default('character'), // character, location, item, etc.
  description: text('description').notNull().default(''),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * User Profiles table
 * Represents user subscription and credits information
 */
export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(), // Same as better-auth user.id
  subscription: text('subscription').notNull().default('free'), // 'free' | 'pro' | 'premium'
  credits: integer('credits').notNull().default(10000), // AI credits
  creditsResetAt: timestamp('credits_reset_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Relations
 * Define relationships between tables
 */
export const storiesRelations = relations(stories, ({ many }) => ({
  chapters: many(chapters),
  loreEntries: many(loreEntries),
}));

export const chaptersRelations = relations(chapters, ({ one }) => ({
  story: one(stories, {
    fields: [chapters.storyId],
    references: [stories.id],
  }),
}));

export const loreEntriesRelations = relations(loreEntries, ({ one }) => ({
  story: one(stories, {
    fields: [loreEntries.storyId],
    references: [stories.id],
  }),
}));

// Type exports for use in components
export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;
export type LoreEntry = typeof loreEntries.$inferSelect;
export type NewLoreEntry = typeof loreEntries.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
