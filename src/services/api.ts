import { invoke } from '@tauri-apps/api/core';
import { Cloister, Presence, Message, Quote, ExportData } from '../types/schemas';

// Tauri invoke wrappers with fallback to in-memory/localStorage for web-preview / testing environments
const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// LocalStorage mock state for pure web preview or browser environment
const STORAGE_KEY = 'antechamber_mock_data_v2';

function getMockData(): ExportData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fallback
    }
  }
  const defaultData: ExportData = {
    version: '0.2.0',
    exportedAt: Date.now(),
    cloisters: [
      {
        id: 'c-default',
        title: 'Cloister 1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    presences: [],
    messages: [],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
}

function saveMockData(data: ExportData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const api = {
  async getCloisters(): Promise<Cloister[]> {
    if (isTauri()) {
      const res: any = await invoke('get_cloisters');
      return res.map((r: any) => ({
        id: r.id,
        title: r.title,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    return getMockData().cloisters;
  },

  async createCloister(title: string): Promise<Cloister> {
    if (isTauri()) {
      const r: any = await invoke('create_cloister', { title });
      return {
        id: r.id,
        title: r.title,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }
    const data = getMockData();
    const newCloister: Cloister = {
      id: 'c-' + Date.now(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    data.cloisters.unshift(newCloister);
    saveMockData(data);
    return newCloister;
  },

  async updateCloister(id: string, title: string): Promise<void> {
    if (isTauri()) {
      return await invoke('update_cloister', { id, title });
    }
    const data = getMockData();
    const c = data.cloisters.find((item: Cloister) => item.id === id);
    if (c) {
      c.title = title;
      c.updatedAt = Date.now();
      saveMockData(data);
    }
  },

  async deleteCloister(id: string): Promise<void> {
    if (isTauri()) {
      return await invoke('delete_cloister', { id });
    }
    const data = getMockData();
    data.cloisters = data.cloisters.filter((item: Cloister) => item.id !== id);
    data.messages = data.messages.filter((item: Message) => item.cloisterId !== id);
    saveMockData(data);
  },

  async getPresences(cloisterId: string): Promise<Presence[]> {
    if (isTauri()) {
      const res: any = await invoke('get_presences', { cloisterId });
      return res.map((r: any) => ({
        id: r.id,
        cloisterId: r.cloister_id,
        name: r.name,
        description: r.description,
        color: r.color,
        createdAt: r.created_at,
      }));
    }
    return getMockData().presences.filter((p: Presence) => p.cloisterId === cloisterId);
  },

  async createPresence(cloisterId: string, name: string, description: string, color: string): Promise<Presence> {
    if (isTauri()) {
      const r: any = await invoke('create_presence', { cloisterId, name, description, color });
      return {
        id: r.id,
        cloisterId: r.cloister_id,
        name: r.name,
        description: r.description,
        color: r.color,
        createdAt: r.created_at,
      };
    }
    const data = getMockData();
    const p: Presence = {
      id: 'p-' + Date.now(),
      cloisterId,
      name,
      description,
      color,
      createdAt: Date.now(),
    };
    data.presences.push(p);
    saveMockData(data);
    return p;
  },

  async updatePresence(id: string, name: string, description: string, color: string): Promise<void> {
    if (isTauri()) {
      return await invoke('update_presence', { id, name, description, color });
    }
    const data = getMockData();
    const p = data.presences.find((item: Presence) => item.id === id);
    if (p) {
      p.name = name;
      p.description = description;
      p.color = color;
      saveMockData(data);
    }
  },

  async deletePresence(id: string): Promise<void> {
    if (isTauri()) {
      return await invoke('delete_presence', { id });
    }
    const data = getMockData();
    data.presences = data.presences.filter((item: Presence) => item.id !== id);
    saveMockData(data);
  },

  async getMessages(cloisterId: string): Promise<Message[]> {
    if (isTauri()) {
      const res: any = await invoke('get_messages', { cloisterId });
      return res.map((r: any) => ({
        id: r.id,
        cloisterId: r.cloister_id,
        presenceId: r.presence_id,
        content: r.content,
        quotes: (r.quotes || []).map((q: any) => ({
          sourceMessageId: q.source_message_id,
          sourcePresenceName: q.source_presence_name,
          text: q.text,
        })),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        editHistory: (r.edit_history || []).map((h: any) => ({
          previousContent: h.previous_content,
          editedAt: h.edited_at,
        })),
        isDeleted: r.is_deleted,
      }));
    }
    return getMockData().messages.filter((m: Message) => m.cloisterId === cloisterId);
  },

  async sendMessage(cloisterId: string, presenceId: string, content: string, quotes: Quote[]): Promise<Message> {
    if (isTauri()) {
      const mappedQuotes = quotes.map((q) => ({
        source_message_id: q.sourceMessageId,
        source_presence_name: q.sourcePresenceName,
        text: q.text,
      }));
      const r: any = await invoke('send_message', {
        cloisterId,
        presenceId,
        content,
        quotes: mappedQuotes,
      });
      return {
        id: r.id,
        cloisterId: r.cloister_id,
        presenceId: r.presence_id,
        content: r.content,
        quotes: (r.quotes || []).map((q: any) => ({
          sourceMessageId: q.source_message_id,
          sourcePresenceName: q.source_presence_name,
          text: q.text,
        })),
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        editHistory: [],
        isDeleted: r.is_deleted,
      };
    }
    const data = getMockData();
    const msg: Message = {
      id: 'm-' + Date.now(),
      cloisterId,
      presenceId,
      content,
      quotes,
      createdAt: Date.now(),
      isDeleted: false,
    };
    data.messages.push(msg);
    const cloister = data.cloisters.find((c: Cloister) => c.id === cloisterId);
    if (cloister) {
      cloister.updatedAt = msg.createdAt;
    }
    saveMockData(data);
    return msg;
  },

  async editMessage(id: string, content: string): Promise<void> {
    if (isTauri()) {
      return await invoke('edit_message', { id, content });
    }
    const data = getMockData();
    const m = data.messages.find((item: Message) => item.id === id);
    if (m) {
      if (!m.editHistory) m.editHistory = [];
      m.editHistory.push({
        previousContent: m.content,
        editedAt: Date.now(),
      });
      m.content = content;
      m.updatedAt = Date.now();
      saveMockData(data);
    }
  },

  async deleteMessage(id: string): Promise<void> {
    if (isTauri()) {
      return await invoke('delete_message', { id });
    }
    const data = getMockData();
    const m = data.messages.find((item: Message) => item.id === id);
    if (m) {
      m.isDeleted = true;
      saveMockData(data);
    }
  },

  async searchMessages(query: string): Promise<Array<{message: Message, cloisterTitle: string, presenceName: string}>> {
    if (isTauri()) {
      const res: any = await invoke('search_messages', { query });
      return res.map((r: any) => ({
        message: {
          id: r[0].id,
          cloisterId: r[0].cloister_id,
          presenceId: r[0].presence_id,
          content: r[0].content,
          quotes: (r[0].quotes || []).map((q: any) => ({
            sourceMessageId: q.source_message_id,
            sourcePresenceName: q.source_presence_name,
            text: q.text,
          })),
          createdAt: r[0].created_at,
          updatedAt: r[0].updated_at,
          editHistory: (r[0].edit_history || []).map((h: any) => ({
            previousContent: h.previous_content,
            editedAt: h.edited_at,
          })),
          isDeleted: r[0].is_deleted,
        },
        cloisterTitle: r[1],
        presenceName: r[2],
      }));
    }
    const data = getMockData();
    const cMap = new Map(data.cloisters.map((c: Cloister) => [c.id, c.title]));
    const pMap = new Map(data.presences.map((p: Presence) => [p.id, p.name]));
    return data.messages
      .filter((m: Message) => !m.isDeleted && m.content.toLowerCase().includes(query.toLowerCase()))
      .map((m: Message) => ({
        message: m,
        cloisterTitle: cMap.get(m.cloisterId) || 'Unknown Cloister',
        presenceName: pMap.get(m.presenceId) || 'Unknown Presence',
      }));
  },

  async exportJson(): Promise<string> {
    if (isTauri()) {
      return await invoke('export_json');
    }
    const data = getMockData();
    data.version = '0.2.0';
    return JSON.stringify(data, null, 2);
  },

  async exportJsonl(): Promise<string> {
    if (isTauri()) {
      return await invoke('export_jsonl');
    }
    return getMockData().messages.map((m: Message) => JSON.stringify(m)).join('\n');
  },

  async exportTxt(cloisterId?: string): Promise<string> {
    if (isTauri()) {
      return await invoke('export_txt', { cloisterId });
    }
    const data = getMockData();
    const pMap = new Map(data.presences.map((p: Presence) => [p.id, p.name]));
    const msgs = cloisterId
      ? data.messages.filter((m: Message) => m.cloisterId === cloisterId && !m.isDeleted)
      : data.messages.filter((m: Message) => !m.isDeleted);

    return msgs
      .map((m: Message) => {
        const time = new Date(m.createdAt).toISOString();
        const pName = pMap.get(m.presenceId) || 'Unknown';
        const quoteLines = m.quotes
          .map((q: Quote) => `  > [${q.sourcePresenceName}] ${q.text}`)
          .join('\n');
        return `[${time}] ${pName}\n${quoteLines ? quoteLines + '\n' : ''}${m.content}\n`;
      })
      .join('\n');
  },

  async restoreJson(jsonContent: string): Promise<void> {
    if (isTauri()) {
      return await invoke('restore_json', { jsonContent });
    }
    const parsed = JSON.parse(jsonContent);
    saveMockData(parsed);
  },
};
