/**
 * Supabase Setup Checker
 *
 * Verifies that required tables exist in Supabase
 */

import { supabase } from '../../../lib/supabase';

export interface SetupStatus {
  isSetup: boolean;
  missingTables: string[];
  error?: string;
}

/**
 * Check if Supabase tables are set up
 */
export async function checkSupabaseSetup(): Promise<SetupStatus> {
  const requiredTables = ['events', 'matches', 'decks'];
  const missingTables: string[] = [];

  try {
    // Try to query each table (limit 0 to not fetch data)
    for (const table of requiredTables) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(0);

      if (error) {
        // Table likely doesn't exist or no RLS policies
        console.error(`[Setup] Table '${table}' check failed:`, error.message);

        // Check if it's a "relation does not exist" error
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          missingTables.push(table);
        }
      }
    }

    const isSetup = missingTables.length === 0;

    return {
      isSetup,
      missingTables,
    };
  } catch (error) {
    console.error('[Setup] Failed to check Supabase setup:', error);
    return {
      isSetup: false,
      missingTables: requiredTables,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get setup instructions for the user
 */
export function getSetupInstructions(): string {
  return `
To enable Cloud Sync, you need to set up your Supabase database:

1. Open your Supabase project dashboard
2. Go to SQL Editor (left sidebar)
3. Create a new query
4. Copy and paste the contents of 'supabase_schema.sql' (in your project root)
5. Click "Run" to create the tables

This only needs to be done once per Supabase project.
  `.trim();
}

/**
 * Create a more user-friendly error message for sync failures
 */
export function formatSyncError(error: any): string {
  const message = error?.message || String(error);

  // Table doesn't exist
  if (message.includes('relation') && message.includes('does not exist')) {
    return 'Database tables not set up. Please run the setup SQL in Supabase.';
  }

  // RLS policy error
  if (message.includes('row-level security') || message.includes('policy')) {
    return 'Row-level security not configured. Please run the setup SQL in Supabase.';
  }

  // Permission error
  if (message.includes('permission') || message.includes('not authorized')) {
    return 'Not authorized. Please check your Supabase authentication.';
  }

  // Generic error
  return `Sync failed: ${message}`;
}
