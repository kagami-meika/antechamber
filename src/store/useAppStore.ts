import { create } from 'zustand';
import { Cloister, Presence, Message, Quote } from '../types/schemas';
import { api } from '../services/api';

interface AppState {
  cloisters: Cloister[];
  activeCloisterId: string | null;
  presences: Presence[];
  activePresenceId: string | null;
  messages: Message[];
  
  // Pending quotes for the composer
  pendingQuotes: Quote[];
  
  // Search query
  searchQuery: string;
  searchResults: Message[] | null;

  // Dark mode
  theme: 'light' | 'dark';

  // Loading / Error
  loading: boolean;
  error: string | null;

  // Actions
  init: () => Promise<void>;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Cloister
  selectCloister: (id: string) => Promise<void>;
  createCloister: (title: string) => Promise<Cloister>;
  updateCloister: (id: string, title: string) => Promise<void>;
  deleteCloister: (id: string) => Promise<void>;

  // Presence
  selectPresence: (id: string) => void;
  cycleNextPresence: () => void;
  createPresence: (name: string, description: string, color: string) => Promise<Presence>;
  updatePresence: (id: string, name: string, description: string, color: string) => Promise<void>;
  deletePresence: (id: string) => Promise<void>;

  // Message
  loadMessages: (cloisterId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  editMessage: (id: string, content: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  // Quote
  addQuote: (quote: Quote) => void;
  removeQuote: (index: number) => void;
  clearQuotes: () => void;

  // Search
  setSearchQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Export / Import
  exportJson: () => Promise<string>;
  exportJsonl: () => Promise<string>;
  exportTxt: () => Promise<string>;
  restoreJson: (jsonContent: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  cloisters: [],
  activeCloisterId: null,
  presences: [],
  activePresenceId: null,
  messages: [],
  pendingQuotes: [],
  searchQuery: '',
  searchResults: null,
  theme: (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light',
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      const cloisters = await api.getCloisters();

      let activeCloisterId = cloisters.length > 0 ? cloisters[0].id : null;

      // If no cloisters exist yet, create a default empty one
      if (cloisters.length === 0) {
        const defaultCloister = await api.createCloister('Cloister 1');
        cloisters.push(defaultCloister);
        activeCloisterId = defaultCloister.id;
      }

      let presences: Presence[] = [];
      let activePresenceId: string | null = null;

      if (activeCloisterId) {
        presences = await api.getPresences(activeCloisterId);
        activePresenceId = presences.length > 0 ? presences[0].id : null;
      }

      set({
        cloisters,
        activeCloisterId,
        presences,
        activePresenceId,
        loading: false,
      });

      if (activeCloisterId) {
        await get().loadMessages(activeCloisterId);
      }
    } catch (err: any) {
      set({ error: err.message || String(err), loading: false });
    }
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: nextTheme });
    if (typeof document !== 'undefined') {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  selectCloister: async (id: string) => {
    set({ activeCloisterId: id, pendingQuotes: [], searchQuery: '', searchResults: null });
    const presences = await api.getPresences(id);
    const activePresenceId = presences.length > 0 ? presences[0].id : null;
    set({ presences, activePresenceId });
    await get().loadMessages(id);
  },

  createCloister: async (title: string) => {
    const cloister = await api.createCloister(title);
    set((state) => ({
      cloisters: [cloister, ...state.cloisters],
      activeCloisterId: cloister.id,
      presences: [],
      activePresenceId: null,
      messages: [],
      pendingQuotes: [],
    }));
    return cloister;
  },

  updateCloister: async (id: string, title: string) => {
    await api.updateCloister(id, title);
    set((state) => ({
      cloisters: state.cloisters.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c)),
    }));
  },

  deleteCloister: async (id: string) => {
    await api.deleteCloister(id);
    const remaining = get().cloisters.filter((c) => c.id !== id);
    const nextActiveId = remaining.length > 0 ? remaining[0].id : null;
    set({
      cloisters: remaining,
      activeCloisterId: nextActiveId,
      presences: [],
      activePresenceId: null,
      messages: [],
      pendingQuotes: [],
    });
    if (nextActiveId) {
      await get().selectCloister(nextActiveId);
    }
  },

  selectPresence: (id: string) => {
    set({ activePresenceId: id });
  },

  cycleNextPresence: () => {
    const { presences, activePresenceId } = get();
    if (presences.length === 0) return;
    const currentIndex = presences.findIndex((p) => p.id === activePresenceId);
    const nextIndex = (currentIndex + 1) % presences.length;
    set({ activePresenceId: presences[nextIndex].id });
  },

  createPresence: async (name: string, description: string, color: string) => {
    const { activeCloisterId } = get();
    if (!activeCloisterId) throw new Error('No active cloister selected');
    const presence = await api.createPresence(activeCloisterId, name, description, color);
    set((state) => ({
      presences: [...state.presences, presence],
      activePresenceId: state.activePresenceId ? state.activePresenceId : presence.id,
    }));
    return presence;
  },

  updatePresence: async (id: string, name: string, description: string, color: string) => {
    await api.updatePresence(id, name, description, color);
    set((state) => ({
      presences: state.presences.map((p) =>
        p.id === id ? { ...p, name, description, color } : p
      ),
    }));
  },

  deletePresence: async (id: string) => {
    await api.deletePresence(id);
    const remaining = get().presences.filter((p) => p.id !== id);
    const nextActiveId = remaining.length > 0 ? remaining[0].id : null;
    set({
      presences: remaining,
      activePresenceId: nextActiveId,
    });
  },

  loadMessages: async (cloisterId: string) => {
    const msgs = await api.getMessages(cloisterId);
    set({ messages: msgs });
  },

  sendMessage: async (content: string) => {
    const { activeCloisterId, activePresenceId, pendingQuotes } = get();
    if (!activeCloisterId || !activePresenceId || !content.trim()) return;

    const msg = await api.sendMessage(activeCloisterId, activePresenceId, content.trim(), pendingQuotes);
    set((state) => ({
      messages: [...state.messages, msg],
      pendingQuotes: [],
      cloisters: state.cloisters.map((c) =>
        c.id === activeCloisterId ? { ...c, updatedAt: msg.createdAt } : c
      ),
    }));
  },

  editMessage: async (id: string, content: string) => {
    await api.editMessage(id, content);
    const { activeCloisterId } = get();
    if (activeCloisterId) {
      await get().loadMessages(activeCloisterId);
    }
  },

  deleteMessage: async (id: string) => {
    await api.deleteMessage(id);
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, isDeleted: true } : m)),
    }));
  },

  addQuote: (quote: Quote) => {
    set((state) => ({
      pendingQuotes: [...state.pendingQuotes, quote],
    }));
  },

  removeQuote: (index: number) => {
    set((state) => ({
      pendingQuotes: state.pendingQuotes.filter((_, i) => i !== index),
    }));
  },

  clearQuotes: () => {
    set({ pendingQuotes: [] });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      set({ searchResults: null });
    }
  },

  search: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: null });
      return;
    }
    const results = await api.searchMessages(query.trim());
    set({ searchResults: results });
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: null });
  },

  exportJson: async () => {
    return await api.exportJson();
  },

  exportJsonl: async () => {
    return await api.exportJsonl();
  },

  exportTxt: async () => {
    const { activeCloisterId } = get();
    return await api.exportTxt(activeCloisterId || undefined);
  },

  restoreJson: async (jsonContent: string) => {
    await api.restoreJson(jsonContent);
    await get().init();
  },
}));
