import { z } from 'zod';

export const QuoteSchema = z.object({
  sourceMessageId: z.string(),
  sourcePresenceName: z.string(),
  text: z.string().min(1, '引用内容不能为空'),
});

export const PresenceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '名称不能为空').max(50, '名称最多50字符'),
  description: z.string().max(200, '描述最多200字符').default(''),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, '非法颜色值'),
  createdAt: z.number(),
});

export const MessageEditHistorySchema = z.object({
  previousContent: z.string(),
  editedAt: z.number(),
});

export const MessageSchema = z.object({
  id: z.string(),
  cloisterId: z.string(),
  presenceId: z.string(),
  content: z.string().min(1, '消息内容不能为空'),
  quotes: z.array(QuoteSchema).default([]),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
  editHistory: z.array(MessageEditHistorySchema).optional(),
  isDeleted: z.boolean().default(false),
});

export const CloisterSchema = z.object({
  id: z.string(),
  title: z.string().min(1, '标题不能为空').max(100, '标题最多100字符'),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const ExportDataSchema = z.object({
  version: z.string(),
  exportedAt: z.number(),
  cloisters: z.array(CloisterSchema),
  presences: z.array(PresenceSchema),
  messages: z.array(MessageSchema),
});

export type Quote = z.infer<typeof QuoteSchema>;
export type Presence = z.infer<typeof PresenceSchema>;
export type MessageEditHistory = z.infer<typeof MessageEditHistorySchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Cloister = z.infer<typeof CloisterSchema>;
export type ExportData = z.infer<typeof ExportDataSchema>;
