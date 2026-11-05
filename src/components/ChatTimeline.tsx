import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MessageItem } from './MessageItem';
import { Message } from '../types/schemas';
import { MessageSquareOff, Search } from 'lucide-react';

export const ChatTimeline: React.FC = () => {
  const {
    messages,
    presences,
    activeCloisterId,
    cloisters,
    addQuote,
    searchResults,
    searchQuery,
  } = useAppStore();

  const bottomRef = useRef<HTMLDivElement>(null);
  const activeCloister = cloisters.find((c) => c.id === activeCloisterId);
  const presenceMap = new Map(presences.map((p) => [p.id, p]));

  const displayMessages = searchResults !== null ? searchResults : messages;

  useEffect(() => {
    // Only scroll to bottom in normal timeline mode when a new message arrives
    if (searchResults === null) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, searchResults]);

  const handleQuoteText = (quoteText: string, sourceMsg: Message) => {
    const sourcePresence = presenceMap.get(sourceMsg.presenceId);
    addQuote({
      sourceMessageId: sourceMsg.id,
      sourcePresenceName: sourcePresence?.name || '未知身份',
      text: quoteText,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950">
      {/* Top Header of Cloister */}
      <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between select-none">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {searchResults !== null ? (
              <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <Search size={14} />
                <span>搜索关键词: “{searchQuery}” ({searchResults.length} 条匹配)</span>
              </span>
            ) : (
              activeCloister?.title || ''
            )}
          </h2>
          <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
            {searchResults !== null
              ? '搜索结果覆盖所有历史记录'
              : `${messages.filter((m) => !m.isDeleted).length} 条消息`}
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1">
        {displayMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none">
            <MessageSquareOff className="text-zinc-300 dark:text-zinc-700 mb-3" size={32} />
            <p className="text-xs text-zinc-500 font-medium">
              {searchResults !== null ? '未找到相关对话片段' : '暂无对话'}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto divide-y divide-zinc-100 dark:divide-zinc-900">
            {displayMessages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                presence={presenceMap.get(msg.presenceId)}
                onQuoteText={handleQuoteText}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};
