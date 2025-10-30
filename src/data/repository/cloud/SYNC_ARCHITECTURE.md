# Cloud Sync Architecture

## Current Implementation: Async & Non-Blocking ✅

The current sync system is **fully async and non-blocking**:

### Write Flow
```typescript
// User action (e.g., create event)
await cloudEventRepo.create(eventData)
  ↓
1. Write to SQLite (synchronous, ~5ms)
  ↓
2. Queue sync operation (synchronous, ~1ms - just adds to array)
  ↓
3. Return to user (DONE - user not blocked!)
  ↓
4. Background: processQueue() runs async (fire-and-forget)
  ↓
5. Background: Upload to Supabase when online
```

**Total user-facing latency:** ~6ms (just SQLite write + array push)

### Sync Order & Foreign Key Constraints

**IMPORTANT:** Sync order matters due to database foreign key constraints!

```typescript
// Correct order:
1. Events (no dependencies)
2. Decks (no dependencies)
3. Matches (depends on events + decks)

// Why:
- matches.event_id references events.id
- matches.my_deck_id references decks.id
```

The sync queue processes items **sequentially**, so items are synced in the order they're queued. The `cloudSyncService.syncAllDataToCloud()` function ensures correct ordering.

### Key Features
- **Local-first**: Writes to SQLite immediately, UI never blocks
- **Fire-and-forget**: Sync happens in background
- **Network-aware**: Auto-pauses when offline, resumes when online
- **Persistent**: Queue survives app restarts (AsyncStorage)
- **Exponential backoff**: 1s → 2s → 4s → 8s → 16s → 32s → 60s max
- **Retry limit**: Max 5 retries before dropping operation

## Alternative Queue Libraries Considered

### 1. **react-native-queue** (Not Recommended)
- ❌ Last updated 5+ years ago
- ❌ Not actively maintained
- ❌ No TypeScript support

### 2. **react-native-background-fetch** (Potential Enhancement)
```bash
npm install react-native-background-fetch
```
- ✅ Runs tasks in background even when app is closed
- ✅ iOS and Android support
- ⚠️ Requires native module linking
- ⚠️ Limited execution time (15-30 seconds)
- **Use case**: Periodic sync checks when app is closed

### 3. **@react-native-async-storage/async-storage** (Current) ✅
```bash
# Already installed
```
- ✅ Official React Native storage
- ✅ Simple, reliable, fast
- ✅ Perfect for queue persistence
- **Our choice**: Works great for our needs

### 4. **Custom Queue (Current Implementation)** ✅
```typescript
// What we built
class SyncQueue {
  - NetInfo integration (network detection)
  - Exponential backoff
  - Persistent queue (AsyncStorage)
  - Duplicate prevention
  - Manual sync trigger
}
```

**Why custom is best for our use case:**
1. Full control over retry logic
2. No extra dependencies (just NetInfo + AsyncStorage)
3. Tailored to Supabase integration
4. Simple to maintain and debug
5. Already implements all needed features

## Performance Characteristics

### Sync Operation Timing
- **Local write (SQLite)**: ~5ms
- **Queue operation**: ~1ms
- **Supabase upsert**: ~200-500ms (background, doesn't block UI)
- **Network detection**: Real-time via NetInfo

### Memory Usage
- **Queue storage**: ~1KB per operation
- **Typical queue size**: 0-50 operations
- **Max memory impact**: ~50KB

### Network Usage
- **Per operation**: ~1-5KB (JSON payload)
- **Batch operations**: Queue processes sequentially
- **Failed operations**: Stored locally, retry when online

## Manual Sync Feature

Added `cloudSyncService.syncAllDataToCloud()` for:
- **Initial cloud setup**: Upload all existing SQLite data
- **Storage migration**: When switching from SQLite-only to Cloud
- **Manual backup**: User-triggered full sync

### Usage
```typescript
const result = await cloudSyncService.syncAllDataToCloud((progress) => {
  console.log(`${progress.completed}/${progress.total}: ${progress.currentItem}`);
});

if (result.success) {
  console.log('All data synced!');
}
```

## Potential Future Enhancements

### 1. Background Sync (Optional)
If you want sync to continue when app is closed:

```bash
npm install react-native-background-fetch
```

Then wrap queue processing in background task.

### 2. Batch Uploads (Optional)
Currently: One operation at a time
Future: Batch multiple operations into single request

```typescript
// Instead of:
await supabase.from('events').upsert(event1);
await supabase.from('events').upsert(event2);

// Could do:
await supabase.from('events').upsert([event1, event2]);
```

### 3. Conflict Resolution (Optional)
Currently: Last write wins
Future: Timestamp-based or custom resolution

```typescript
if (serverTimestamp > localTimestamp) {
  // Server version is newer
}
```

## Monitoring & Debugging

### Console Logs
```
[SyncQueue] Network status: Online
[SyncQueue] Enqueued create for events:abc123 (queue size: 1)
[SyncQueue] Starting to process 1 operations
[SyncQueue] Successfully synced events:abc123 (0 remaining)
```

### UI Indicators
- **Storage section**: Shows queue status (pending count, online/offline)
- **Sync button**: Manual trigger with progress bar
- **Auto-refresh**: Queue status updates every 2 seconds

## Architecture Diagram

```
┌─────────────────┐
│   User Action   │
│  (Create/Edit)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Cloud Repo     │──────┐
│  (BaseCloud)    │      │ 1. Write Local (fast)
└────────┬────────┘      │
         │               │
         ▼               ▼
┌─────────────────┐  ┌──────────────┐
│  SQLite Repo    │  │  Sync Queue  │
│  (Composition)  │  │  (Enqueue)   │
└─────────────────┘  └──────┬───────┘
                            │
                            │ 2. Background Process
                            ▼
                     ┌──────────────┐
                     │  NetInfo     │
                     │  (Online?)   │
                     └──────┬───────┘
                            │
                     ┌──────┴───────┐
                     │              │
                 Online          Offline
                     │              │
                     ▼              ▼
              ┌──────────┐    ┌─────────┐
              │ Supabase │    │  Retry  │
              │  Upload  │    │  Later  │
              └──────────┘    └─────────┘
```

## Conclusion

**Current implementation is production-ready** with:
- ✅ Async, non-blocking writes
- ✅ Network-aware sync
- ✅ Persistent queue
- ✅ Exponential backoff
- ✅ Manual sync trigger
- ✅ Real-time status monitoring

No additional libraries needed unless you want:
- Background sync when app is closed (use react-native-background-fetch)
- More complex queue patterns (probably overkill for this use case)
