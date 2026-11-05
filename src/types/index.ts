export interface Presence {
  id: string;
  cloisterId: string;
  name: string;
  description: string;
  color: string;
  createdAt: number;
}

export interface Quote {
  sourceMessageId: string;
  sourcePresenceName: string;
  text: string;
}

export interface MessageEditHistory {
  previousContent: string;
  editedAt: number;
}

export interface Message {
  id: string;
  cloisterId: string;
  presenceId: string;
  content: string;
  quotes: Quote[];
  createdAt: number;
  updatedAt?: number;
  editHistory?: MessageEditHistory[];
  isDeleted?: boolean;
}

export interface Cloister {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface ExportData {
  version: string;
  exportedAt: number;
  cloisters: Cloister[];
  presences: Presence[];
  messages: Message[];
}
