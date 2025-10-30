import { create } from 'zustand';
import { Deck } from '../domain/types';
import * as DeckRepo from '../data/deckRepo';

interface DeckState {
  decks: Deck[];
  loading: boolean;
  error: string | null;

  // Actions
  loadDecks: () => Promise<void>;
  getDeck: (id: string) => Deck | undefined;
  createDeck: (data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Deck>;
  updateDeck: (id: string, data: Partial<Deck>) => Promise<void>;
  archiveDeck: (id: string, archived?: boolean) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  refreshDecks: () => Promise<void>;
}

export const useDeckStore = create<DeckState>((set, get) => ({
  decks: [],
  loading: false,
  error: null,

  loadDecks: async () => {
    set({ loading: true, error: null });
    try {
      const decks = await DeckRepo.list();
      set({ decks, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  getDeck: (id: string) => {
    return get().decks.find((deck) => deck.id === id);
  },

  createDeck: async (data) => {
    set({ loading: true, error: null });
    try {
      const newDeck = await DeckRepo.create(data);
      set((state) => ({
        decks: [...state.decks, newDeck],
        loading: false,
      }));
      return newDeck;
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  updateDeck: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedDeck = await DeckRepo.update(id, data);
      if (updatedDeck) {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === id ? updatedDeck : deck
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  archiveDeck: async (id, archived = true) => {
    set({ loading: true, error: null });
    try {
      const updatedDeck = await DeckRepo.archive(id, archived);
      if (updatedDeck) {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === id ? updatedDeck : deck
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  deleteDeck: async (id) => {
    set({ loading: true, error: null });
    try {
      await DeckRepo.remove(id);
      set((state) => ({
        decks: state.decks.filter((deck) => deck.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  refreshDecks: async () => {
    await get().loadDecks();
  },
}));
