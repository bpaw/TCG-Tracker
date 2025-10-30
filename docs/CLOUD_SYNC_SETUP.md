# Cloud Sync Setup Guide

## Step 1: Set Up Supabase Tables (One-Time Setup)

You need to create the database tables in your Supabase project before cloud sync will work.

### Method A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard** at https://supabase.com/dashboard
2. **Click on "SQL Editor"** in the left sidebar
3. **Click "New query"**
4. **Copy the entire contents** of `supabase_schema.sql` (in your project root)
5. **Paste into the SQL editor**
6. **Click "Run"** or press Cmd/Ctrl + Enter

You should see a success message. The script creates:
- `events` table
- `matches` table
- `decks` table
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for `updated_at` timestamps

### Method B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Step 2: Verify Setup in the App

1. **Open your app**
2. **Go to Profile → Settings → Storage**
3. **Switch to "Cloud Sync" mode**
4. **Click "Check Supabase Setup"**

You should see: **"Setup Complete ✓"**

If you see missing tables, go back to Step 1.

## Step 3: Sync Your Existing Data

If you already have events/matches/decks stored locally in SQLite:

1. **Click "Sync All Data to Cloud"**
2. **Confirm the action**
3. **Wait for the progress bar** to complete
4. **You'll see a success message**

Your data is now backed up to Supabase!

## Troubleshooting

### "Missing tables" error
- Run the SQL schema in Supabase dashboard (Step 1)
- Make sure you're logged in with the correct Supabase account

### "Foreign key constraint" error
```
violates foreign key constraint "matches_event_id_fkey"
```
- This means matches are being synced before events/decks
- The sync order is: Events → Decks → Matches (to respect foreign keys)
- If you see this error during manual sync, try again - the order should be correct
- If creating a single match, make sure the event/deck exist first

### "Not authorized" error
- Make sure you're signed in to the app
- Check that RLS policies were created (they're in the schema)
- Your user ID should match between app and Supabase

### Sync queue stuck
- Check your internet connection
- Look at the "Sync Queue" status (updates every 2s)
- If offline, sync will auto-resume when back online
- Failed operations retry with exponential backoff (up to 5 times)
- After 5 retries, operations are dropped from queue

### Want to clear the queue?
If you have failed operations stuck in the queue:
```typescript
import { syncQueue } from './src/data/repository/cloud/syncQueue';
await syncQueue.clear();
```

Or restart the app after fixing the underlying issue.

## How Cloud Sync Works

### Automatic Background Sync
When you create/update/delete data:
1. ✅ Writes to SQLite immediately (~5ms, UI never blocks)
2. ✅ Queues sync operation (~1ms)
3. ✅ Uploads to Supabase in background (async, non-blocking)

### Network Awareness
- **Online**: Syncs immediately
- **Offline**: Queues operations, syncs when back online
- **Auto-retry**: Exponential backoff (1s, 2s, 4s, 8s, 16s, 32s, 60s)
- **Persistent**: Queue survives app restarts

### What Gets Synced
- All events (name, dates, rounds, notes)
- All matches (deck, opponent, result, round, notes)
- All decks (title, archetype, colors, notes)

### Data Security
- **Row Level Security (RLS)**: Users can only access their own data
- **User ID filtering**: All queries filtered by authenticated user
- **Secure by default**: No data leaks between users

## Switching Storage Modes

You can switch between storage modes anytime:

- **SQLite**: Local database only (default, fastest)
- **AsyncStorage**: Simple key-value storage (legacy)
- **Cloud Sync**: SQLite + automatic Supabase backup

**Your data is preserved** when switching modes! Cloud sync just adds backup, doesn't replace SQLite.

## Console Logs to Watch

When things are working correctly, you'll see:

```
[Config] Loaded storage type from persistence: cloud
[SyncQueue] Network status: Online
[SyncQueue] Enqueued create for events:abc-123 (queue size: 1)
[SyncQueue] Starting to process 1 operations
[SyncQueue] Successfully synced events:abc-123 (0 remaining)
```

When setup is missing:

```
[SyncQueue] Sync failed: Database tables not set up. Please run the setup SQL in Supabase.
```

## Schema File Location

The SQL schema is at: **`supabase_schema.sql`** (project root)

This file contains all the CREATE TABLE statements, RLS policies, and indexes.

## Need Help?

Check the detailed architecture docs: `src/data/repository/cloud/SYNC_ARCHITECTURE.md`
