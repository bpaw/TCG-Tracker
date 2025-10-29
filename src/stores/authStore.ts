/**
 * Authentication Store
 * Manages user authentication state with Supabase
 */

import { create } from 'zustand';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthStrategy, AuthStrategyFactory } from '../lib/authStrategies';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithStrategy: (strategy: AuthStrategy) => Promise<{ error: AuthError | Error | null }>;
  signUpWithStrategy: (strategy: AuthStrategy) => Promise<{ error: AuthError | Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  signInWithApple: () => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          loading: false,
        });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false, initialized: true });
    }
  },

  signInWithStrategy: async (strategy: AuthStrategy) => {
    set({ loading: true });
    const { error } = await strategy.signIn();

    if (error) {
      set({ loading: false });
      return { error };
    }

    // Get the updated session after sign in
    const { data: { session } } = await supabase.auth.getSession();

    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });

    return { error: null };
  },

  signUpWithStrategy: async (strategy: AuthStrategy) => {
    if (!strategy.signUp) {
      return { error: new Error('This authentication method does not support sign up') };
    }

    set({ loading: true });
    const { error } = await strategy.signUp();

    if (error) {
      set({ loading: false });
      return { error };
    }

    // Get the updated session after sign up
    const { data: { session } } = await supabase.auth.getSession();

    set({
      session,
      user: session?.user ?? null,
      loading: false,
    });

    return { error: null };
  },

  signInWithEmail: async (email: string, password: string) => {
    const strategy = AuthStrategyFactory.createStrategy('email', { email, password });
    return get().signInWithStrategy(strategy);
  },

  signUpWithEmail: async (email: string, password: string) => {
    const strategy = AuthStrategyFactory.createStrategy('email', { email, password });
    return get().signUpWithStrategy(strategy);
  },

  signInWithGoogle: async () => {
    const strategy = AuthStrategyFactory.createStrategy('google');
    return get().signInWithStrategy(strategy);
  },

  signInWithApple: async () => {
    const strategy = AuthStrategyFactory.createStrategy('apple');
    return get().signInWithStrategy(strategy);
  },

  signOut: async () => {
    set({ loading: true });

    await supabase.auth.signOut();

    set({
      session: null,
      user: null,
      loading: false,
    });
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'your-app-scheme://reset-password',
    });

    return { error };
  },
}));
