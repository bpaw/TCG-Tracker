import { create } from 'zustand';
import { Event } from '../domain/types';
import * as EventRepo from '../data/eventRepo';

interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;

  // Actions
  loadEvents: () => Promise<void>;
  getEvent: (id: string) => Event | undefined;
  createEvent: (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Event>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  error: null,

  loadEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await EventRepo.list();
      set({ events, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  getEvent: (id: string) => {
    return get().events.find((event) => event.id === id);
  },

  createEvent: async (data) => {
    set({ loading: true, error: null });
    try {
      const newEvent = await EventRepo.create(data);
      set((state) => ({
        events: [newEvent, ...state.events],
        loading: false,
      }));
      return newEvent;
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  updateEvent: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updatedEvent = await EventRepo.update(id, data);
      if (updatedEvent) {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? updatedEvent : event
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  deleteEvent: async (id) => {
    set({ loading: true, error: null });
    try {
      await EventRepo.remove(id);
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  refreshEvents: async () => {
    await get().loadEvents();
  },
}));
