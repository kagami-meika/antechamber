import { create } from 'zustand';
import { Cloister, Presence, Message, Quote } from '../types/schemas';
import { api } from '../services/api';

export interface SearchResultItem {
  message: Message;
  cloisterTitle: string;
  presenceName: string;
}

export interface SettingsConfig {
  fontSize: number; // default 14
  fontFamily: string; // default sans
  quoteFontSize: number; // default 12
  quoteFontFamily: string; // default sans
  showTimestamp: boolean; // default true
  timestampFormat: 'time-only' | 'full'; // default time-only
  sidebarWidth: number; // default 260
}

interface AppState {
  cloisters: Cloister[];
  activeCloisterId: string | null;
  presences: Presence[];
  activePresenceId: string | null;
  messages: Message[];
  
  // Pending quotes for the composer
  pendingQuotes: Quote[];
  
  // Search query & results
  searchQuery: string;
  searchResults: SearchResultItem[] | null;
  isSearchActive: boolean;

  // Settings
  settings: SettingsConfig;
  updateSettings: (partial: Partial<SettingsConfig>) => void;

  // Dark mode
  theme: 'light' | 'dark';

  // Loading / Error
  loading: boolean;
  error: string | null;

  // UI Modal State
  isConfirmOpen: boolean;
  confirmData: {
    title: string;
    message: string;
    onConfirm: () => void;
  } | null;

  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;


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

const DEFAULT_SETTINGS: SettingsConfig = {
  fontSize: 13,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  quoteFontSize: 12,
  quoteFontFamily: 'system-ui, -apple-system, sans-serif',
  showTimestamp: true,
  timestampFormat: 'time-only',
  sidebarWidth: 260,
};

function loadSettings(): SettingsConfig {
  try {
    const raw = localStorage.getItem('antechamber_settings_v1');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(s: SettingsConfig) {
  try {
    localStorage.setItem('antechamber_settings_v1', JSON.stringify(s));
  } catch {}
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
  isConfirmOpen: false,
  confirmData: null,

  openConfirm: (title: string, message: string, onConfirm: () => void) => {
    set({
      isConfirmOpen: true,
      confirmData: { title, message, onConfirm },
    });
  },
  closeConfirm: () => {
    set({ isConfirmOpen: false, confirmData: null });
  },

  settings: loadSettings(),
  updateSettings: (partial: Partial<SettingsConfig>) => {
    set((state) => {
      const newSettings = { ...state.settings, ...partial };
      saveSettings(newSettings);
      return { settings: newSettings };
    });
  },
  isSearchActive: false,

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
    set({
      activeCloisterId: id,
      pendingQuotes: [],
      searchQuery: '',
      searchResults: null,
      messages: [],
      presences: [],
      activePresenceId: null,
    });

    const [presences, messages] = await Promise.all([
      api.getPresences(id),
      api.getMessages(id),
    ]);

    // Check race condition: only update state if user hasn't switched to another cloister in the meantime
    if (get().activeCloisterId === id) {
      const activePresenceId = presences.length > 0 ? presences[0].id : null;
      set({
        presences,
        activePresenceId,
        messages,
      });
    }
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
    if (get().activeCloisterId === cloisterId) {
      set({ messages: msgs });
    }
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
      set({ searchResults: null, isSearchActive: false });
    } else {
      set({ isSearchActive: true });
    }
  },

  search: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: null, isSearchActive: false });
      return;
    }
    set({ isSearchActive: true });
    const results = await api.searchMessages(query.trim());
    set({ searchResults: results });
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: null, isSearchActive: false });
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
