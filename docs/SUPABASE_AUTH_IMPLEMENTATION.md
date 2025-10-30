# Supabase Authentication Implementation Guide

## ✅ Completed (10/17 tasks)

### 1. Dependencies Installed
- `@supabase/supabase-js` - Supabase client
- `expo-auth-session`, `expo-crypto`, `expo-web-browser` - OAuth support
- `expo-apple-authentication` - Apple Sign In
- `react-native-url-polyfill` - Required polyfill

### 2. Files Created

#### Configuration
- **`src/lib/supabase.ts`** - Supabase client with AsyncStorage persistence and type definitions
- **`.env.example`** - Template for environment variables
- **`.env`** - Your credentials (already set up)

#### Authentication Strategy Pattern
- **`src/lib/authStrategies.ts`** - Strategy pattern implementation:
  - `EmailPasswordStrategy` - Email/password authentication
  - `GoogleOAuthStrategy` - Google OAuth with PKCE flow
  - `AppleOAuthStrategy` - Apple Sign In (stub for now)
  - `AuthStrategyFactory` - Factory to create strategies

#### State Management
- **`src/stores/authStore.ts`** - Zustand store with:
  - Session and user state management
  - Strategy-based sign in/sign up
  - Helper methods for each auth method
  - Password reset functionality

#### Screens
- **`src/screens/LoginScreen.tsx`** - Full-featured login with:
  - Email/password form
  - Google OAuth button
  - Apple OAuth button
  - Forgot password link
  - Sign up navigation

- **`src/screens/SignUpScreen.tsx`** - Account creation with:
  - Email/password form with confirmation
  - Validation (min 6 chars, matching passwords)
  - OAuth options (Google, Apple)
  - Sign in navigation

- **`src/screens/ForgotPasswordScreen.tsx`** - Password reset:
  - Email input for reset
  - Sends reset email via Supabase
  - Back to sign in navigation

## 🚧 Remaining Tasks (7/17)

### 3. Navigation Integration
**Status**: Not started
**Files to modify**:
- `src/navigation/RootNavigator.tsx`
- `App.tsx`

**What's needed**:
1. Initialize auth store in App.tsx
2. Create Auth Stack Navigator (Login, SignUp, ForgotPassword)
3. Create App Stack Navigator (existing Dashboard, Events, etc.)
4. Conditional rendering based on `user` state
5. Loading screen while checking session

### 4. Database Schema
**Status**: Not started
**Where**: Supabase Dashboard → SQL Editor

**SQL to run**:
```sql
-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  total_rounds INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  round_number INTEGER NOT NULL,
  opponent_name TEXT,
  opponent_deck TEXT,
  result TEXT NOT NULL CHECK (result IN ('WIN', 'LOSS', 'TIE')),
  went_first BOOLEAN NOT NULL,
  notes TEXT,
  deck_id UUID REFERENCES decks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decks table
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  game TEXT NOT NULL,
  format TEXT,
  archetype TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for matches and decks
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches"
  ON matches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches"
  ON matches FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own decks"
  ON decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own decks"
  ON decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON decks FOR DELETE
  USING (auth.uid() = user_id);
```

### 5. Repository Updates
**Status**: Not started
**Files to modify**:
- `src/data/eventRepo.ts`
- `src/data/matchRepo.ts`
- `src/data/deckRepo.ts`

**Strategy**: Keep local storage, add Supabase methods
- Add `syncToCloud()` method to each repo
- Add `syncFromCloud()` method to each repo
- Add user_id to all operations
- Maintain local storage as fallback

### 6. Sign Out Implementation
**Status**: Not started
**File to modify**: `src/screens/ProfileScreen.tsx`

**What's needed**:
- Add sign out button
- Call `useAuthStore().signOut()`
- Clear local data or keep it (based on sync strategy)
- Show user email/info

### 7. OAuth Configuration

#### Google OAuth Setup
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add redirect URI: `com.mytcgtracker.app:/oauthredirect`
4. Copy Client ID to `.env`:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```
5. In Supabase Dashboard → Authentication → Providers:
   - Enable Google
   - Add your Google Client ID and Secret

#### Apple OAuth Setup (when ready)
1. Apple Developer Account required
2. Enable Sign in with Apple capability
3. In Supabase Dashboard → Authentication → Providers:
   - Enable Apple
   - Follow Supabase's Apple setup guide

## 🔧 Testing Your Implementation

### Test Email/Password Auth
1. Run app
2. Click "Create Account"
3. Enter email/password
4. Check email for verification link
5. Sign in

### Test Google OAuth
1. Click "Continue with Google"
2. Browser opens with Google login
3. Approve permissions
4. Returns to app signed in

### Test Session Persistence
1. Sign in
2. Close app completely
3. Reopen - should still be signed in

## 📝 Notes

### Current State
- All auth screens are built and functional
- Strategy pattern allows easy addition of new auth methods
- Email/password works immediately
- Google OAuth ready (needs Google Cloud setup)
- Apple OAuth stubbed (needs Apple Developer account)

### Environment Variables Needed
```
EXPO_PUBLIC_SUPABASE_URL=<your-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-key>
EXPO_PUBLIC_GOOGLE_CLIENT_ID=<when-configured>
```

### App Scheme
Update in `authStrategies.ts` line 56:
```typescript
scheme: 'com.mytcgtracker.app' // Change to your actual scheme
```

And in `app.json`:
```json
{
  "expo": {
    "scheme": "com.mytcgtracker.app"
  }
}
```

## 🚀 Next Steps

1. **Update Navigation** - Add auth flow to RootNavigator
2. **Create Database Schema** - Run SQL in Supabase
3. **Update Repositories** - Add cloud sync methods
4. **Test Authentication** - Try all sign-in methods
5. **Configure Google OAuth** - Set up Google Cloud Console
6. **Add Sign Out** - Update ProfileScreen
7. **Implement Data Sync** - Sync local data to cloud

## 💡 Design Decisions

### Why Strategy Pattern?
- Easily add new auth methods (Twitter, Discord, etc.)
- Consistent interface for all authentication types
- Testable and maintainable
- Separates auth logic from UI

### Why Keep Local Storage?
- Offline functionality
- Fast local access
- Gradual migration
- Fallback if Supabase is down

### Why Required Auth?
- Cloud sync ensures data safety
- Multi-device support
- Better user experience
- Centralized data management

## 🐛 Common Issues

### "Invalid redirect URI"
- Check `scheme` matches in authStrategies.ts and app.json
- Verify redirect URI in Google Cloud Console

### "Session not found"
- Auth state may take time to initialize
- Check loading states in navigation

### "Row Level Security"
- Ensure RLS policies are created
- Check user_id is passed in all queries

### "Email not verified"
- Supabase may require email verification
- Check Supabase Auth settings
- Look for verification email in inbox
