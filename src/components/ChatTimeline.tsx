import React, { useRef, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MessageItem } from './MessageItem';
import { Message } from '../types/schemas';
import { MessageSquareOff } from 'lucide-react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

export const ChatTimeline: React.FC = () => {
  const {
    messages,
    presences,
    activeCloisterId,
    cloisters,
    addQuote,
  } = useAppStore();

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const activeCloister = cloisters.find((c) => c.id === activeCloisterId);
  const presenceMap = useMemo(() => new Map(presences.map((p) => [p.id, p])), [presences]);

  const handleQuoteText = (quoteText: string, sourceMsg: Message) => {
    const sourcePresence = presenceMap.get(sourceMsg.presenceId);
    addQuote({
      sourceMessageId: sourceMsg.id,
      sourcePresenceName: sourcePresence?.name || '未知身份',
      text: quoteText,
    });
  };

  // Pre-calculate consecutive grouping metadata for O(1) row rendering
  const items = useMemo(() => {
    return messages.map((msg, index) => {
      const prevMsg = messages[index - 1];
      const nextMsg = messages[index + 1];

      const isFirstInGroup =
        !prevMsg ||
        prevMsg.presenceId !== msg.presenceId ||
        prevMsg.isDeleted !== msg.isDeleted;

      const isLastInGroup =
        !nextMsg ||
        nextMsg.presenceId !== msg.presenceId ||
        nextMsg.isDeleted !== msg.isDeleted;

      return {
        message: msg,
        isFirstInGroup,
        isLastInGroup,
      };
    });
  }, [messages]);

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

      {/* Virtualized Message Stream */}
      <div className="flex-1 h-full overflow-hidden">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 select-none">
            <MessageSquareOff className="text-zinc-300 dark:text-zinc-700 mb-3" size={32} />
            <p className="text-xs text-zinc-500 font-medium">暂无对话</p>
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            data={items}
            initialTopMostItemIndex={items.length - 1}
            followOutput="smooth"
            alignToBottom
            className="h-full overflow-y-auto"
            itemContent={(_index, item) => (
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <MessageItem
                  key={item.message.id}
                  message={item.message}
                  presence={presenceMap.get(item.message.presenceId)}
                  isFirstInGroup={item.isFirstInGroup}
                  isLastInGroup={item.isLastInGroup}
                  onQuoteText={handleQuoteText}
                />
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
};
