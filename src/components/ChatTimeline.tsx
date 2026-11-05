import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MessageItem } from './MessageItem';
import { Message } from '../types/schemas';
import { MessageSquareOff } from 'lucide-react';

export const ChatTimeline: React.FC = () => {
  const {
    messages,
    presences,
    activeCloisterId,
    cloisters,
    addQuote,
    isSearchActive,
  } = useAppStore();

  const bottomRef = useRef<HTMLDivElement>(null);
  const activeCloister = cloisters.find((c) => c.id === activeCloisterId);
  const presenceMap = new Map(presences.map((p) => [p.id, p]));

  useEffect(() => {
    if (!isSearchActive) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isSearchActive]);

  const handleQuoteText = (quoteText: string, sourceMsg: Message) => {
    const sourcePresence = presenceMap.get(sourceMsg.presenceId);
    addQuote({
      sourceMessageId: sourceMsg.id,
      sourcePresenceName: sourcePresence?.name || '未知身份',
      text: quoteText,
    });
  };

  // Group messages by consecutive presence to handle the "continuous bar" styling
  const groupedMessages: Message[][] = [];
  let currentGroup: Message[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (i === 0 || msg.presenceId !== messages[i - 1].presenceId || msg.isDeleted !== messages[i - 1].isDeleted) {
      if (currentGroup.length > 0) groupedMessages.push(currentGroup);
      currentGroup = [msg];
    } else {
      currentGroup.push(msg);
    }
  }
  if (currentGroup.length > 0) groupedMessages.push(currentGroup);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950">
      {/* Top Header */}
      <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between select-none">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {activeCloister?.title || ''}
        </h2>
        <div className="text-[11px] text-zinc-400 font-mono">
          {messages.filter((m) => !m.isDeleted).length} 条消息
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-0.5">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none">
            <MessageSquareOff className="text-zinc-300 dark:text-zinc-700 mb-3" size={32} />
            <p className="text-xs text-zinc-500 font-medium">暂无对话</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {groupedMessages.map((group) =>
              group.map((msg, mIdx) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  presence={presenceMap.get(msg.presenceId)}
                  isFirstInGroup={mIdx === 0}
                  isLastInGroup={mIdx === group.length - 1}
                  onQuoteText={handleQuoteText}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};
