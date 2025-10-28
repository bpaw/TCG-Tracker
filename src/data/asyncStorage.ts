import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: migrate to SQLite later for better performance and querying
// Keep these storage keys centralized for easy migration

export const STORAGE_KEYS = {
  DECKS: '@MyTCGTracker:decks',
  MATCHES: '@MyTCGTracker:matches',
  EVENTS: '@MyTCGTracker:events',
  APP_META: '@MyTCGTracker:appMeta',
} as const;

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    throw error;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    throw error;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw error;
  }
}

export async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}
