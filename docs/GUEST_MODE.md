# Guest Mode & Data Migration - Complete Guide

## 🎯 Overview

The AI Fanfiction Generator now supports **Guest Mode**, allowing users to try the application without signing up. Their work is saved locally in `localStorage`, and when they decide to create an account, all their data is automatically migrated to the cloud database.

## 🔄 How It Works

### **Guest Mode Flow**

1. **User visits homepage** → Clicks "Start Writing for Free"
2. **Redirected to `/workbench`** → Opens in Guest Mode
3. **Starts writing** → Content is automatically saved to `localStorage`
4. **After 30 seconds** → Upgrade prompt banner appears
5. **Clicks "Sign Up Free"** → Goes to registration page
6. **Creates account** → Guest data is **automatically migrated** to their new account
7. **Redirected to Dashboard** → Can see their migrated story!

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       User Interface                        │
├─────────────────────────────────────────────────────────────┤
│  Homepage → Workbench (Guest Mode) → Sign Up → Dashboard  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Management Layer                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐        ┌─────────────────────────┐  │
│  │  Guest Mode       │        │  Authenticated Mode      │  │
│  │  (localStorage)   │        │  (PostgreSQL + API)      │  │
│  │                  │        │                          │  │
│  │ guestDataManager │        │ apiService              │  │
│  └──────────────────┘        └─────────────────────────┘  │
│         │                              │                     │
│         └──────────────┬───────────┘                     │
│                        ↓                                  │
│              ┌─────────────────────┐                     │
│              │  Migration Trigger  │                     │
│              │  (after signup)     │                     │
│              └─────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Key Files

### **Guest Data Management**
- `src/lib/guestDataManager.ts` - LocalStorage operations
- `src/contexts/SessionContext.tsx` - User authentication state
- `src/components/Workbench.tsx` - Detects mode & uses appropriate data manager

### **Migration System**
- `src/pages/api/migrate/index.ts` - Migrates guest data to database
- `src/components/SignupForm.tsx` - Auto-triggers migration after signup

### **Pages**
- `src/pages/workbench.astro` - Guest-accessible workbench
- `src/pages/workbench/[story]/[chapter].astro` - Protected user workbench
- `src/pages/index.astro` - Homepage with smart routing

## 🧪 Testing Scenarios

### **Scenario 1: Guest User Journey**
1. Go to http://localhost:4326/
2. Click "Start Writing for Free"
3. Write some content
4. Wait for upgrade prompt (30 seconds)
5. Click "Sign Up Free"
6. Create account
7. ✅ See your story in the dashboard!

### **Scenario 2: Authenticated User**
1. Go to http://localhost:4326/ and click "Sign Up"
2. Create account
3. Redirected to Dashboard
4. Click "New Story" → goes to protected workbench
5. ✅ All data saved to database

### **Scenario 3: Guest Data Migration**
1. Use Guest Mode and write content
2. Sign up
3. Check console for "Migration successful" message
4. Verify story appears in Dashboard with all chapters
5. ✅ localStorage should be cleared

## 🔍 Debugging

### **Check Guest Data**
```javascript
// In browser console
localStorage.getItem('guest_story')
// Should return JSON string with story data or null
```

### **Check Migration**
```javascript
// After signup, check Network tab for:
// POST /api/migrate
// Should return: { success: true, storyId: "..." }
```

### **Clear Guest Data**
```javascript
// In browser console
localStorage.removeItem('guest_story')
```

## ⚠️ Known Limitations

1. **Single Story Limit** - Guest mode only supports one story at a time
2. **localStorage Quota** - Browser storage is limited (~5-10MB)
3. **Device-Specific** - Guest data doesn't sync across devices
4. **No AI Generation** - AI features require authentication

## 🚀 Future Enhancements

- [ ] Multi-story support in guest mode
- [ ] Auto-save progress indicator
- [ ] Export guest data as backup
- [ ] Import from existing files
- [ ] "Save to Browser" vs "Save to Cloud" toggle

## 📊 Data Structure

### **Guest Story Schema**
```typescript
{
  id: string,
  title: string,
  createdAt: string,
  updatedAt: string,
  chapters: [
    {
      id: string,
      storyId: string,
      title: string,
      content: string,
      order: number,
      createdAt: string,
      updatedAt: string
    }
  ],
  loreEntries: [
    {
      id: string,
      storyId: string,
      name: string,
      type: string,
      description: string,
      createdAt: string,
      updatedAt: string
    }
  ]
}
```

## 🎨 User Experience

### **Visual Indicators**
- 🟢 **Authenticated User**: Normal UI, data saved to cloud
- 🟡 **Guest Mode**: "Guest Mode" badge, upgrade prompts
- 🔵 **Migrating**: "Migrating your story..." message during signup

### **Upgrade Prompt Timing**
- Appears after 30 seconds in Guest Mode
- Can be dismissed
- Reappears on next page load if still guest

---

**Built with ❤️ using Better Auth, Drizzle ORM, and Nanostores**
