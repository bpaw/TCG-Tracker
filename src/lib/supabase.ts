/**
 * Supabase Client Configuration
 * Handles authentication and database operations with Supabase
 */

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace these with your actual Supabase credentials
// Get these from: https://app.supabase.com/project/_/settings/api
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database type definitions
export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          game: string;
          start_date: string;
          end_date: string | null;
          total_rounds: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      matches: {
        Row: {
          id: string;
          user_id: string;
          event_id: string | null;
          date: string;
          round_number: number;
          opponent_name: string | null;
          opponent_deck: string | null;
          result: 'WIN' | 'LOSS' | 'TIE';
          went_first: boolean;
          notes: string | null;
          deck_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['matches']['Insert']>;
      };
      decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          game: string;
          format: string | null;
          archetype: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['decks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['decks']['Insert']>;
      };
    };
  };
};
