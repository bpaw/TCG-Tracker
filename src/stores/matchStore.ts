import { create } from 'zustand';
import { Match } from '../domain/types';
import * as MatchRepo from '../data/matchRepo';
import { MatchFilters } from '../data/matchRepo';

interface MatchState {
  matches: Match[];
  loading: boolean;
  error: string | null;
  filters: MatchFilters | undefined;

  // Actions
  loadMatches: (filters?: MatchFilters) => Promise<void>;
  getMatch: (id: string) => Match | undefined;
  createMatch: (data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Match>;
  updateMatch: (id: string, data: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  setFilters: (filters: MatchFilters | undefined) => void;
  refreshMatches: () => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  loading: false,
  error: null,
  filters: undefined,

  loadMatches: async (filters) => {
    set({ loading: true, error: null, filters });
    try {
      const matches = await MatchRepo.list(filters);
      set({ matches, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  getMatch: (id: string) => {
    return get().matches.find((match) => match.id === id);
  },

  createMatch: async (data) => {
    set({ loading: true, error: null });
    try {
      const newMatch = await MatchRepo.create(data);
      // Reload matches with current filters to maintain sort order
      await get().refreshMatches();
      return newMatch;
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  updateMatch: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedMatch = await MatchRepo.update(id, data);
      if (updatedMatch) {
        set((state) => ({
          matches: state.matches.map((match) =>
            match.id === id ? updatedMatch : match
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  deleteMatch: async (id) => {
    set({ loading: true, error: null });
    try {
      await MatchRepo.remove(id);
      set((state) => ({
        matches: state.matches.filter((match) => match.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  refreshMatches: async () => {
    const { filters } = get();
    await get().loadMatches(filters);
  },
}));
