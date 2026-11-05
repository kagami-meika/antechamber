import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Send, X, CornerDownRight } from 'lucide-react';

export const Composer: React.FC = () => {
  const {
    presences,
    activePresenceId,
    selectPresence,
    cycleNextPresence,
    sendMessage,
    pendingQuotes,
    removeQuote,
    activeCloisterId,
  } = useAppStore();

  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activePresence = presences.find((p) => p.id === activePresenceId) || presences[0];

  useEffect(() => {
    // Focus textarea when active presence changes or quote is added
    textareaRef.current?.focus();
  }, [activePresenceId, pendingQuotes.length]);

  const handleSend = async () => {
    if (!content.trim() || !activeCloisterId) return;
    await sendMessage(content);
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      cycleNextPresence();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-grow height up to 180px
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 180)}px`;
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Presence Selector Pills (Spatial Identity) */}
        {presences.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap select-none">
            {presences.map((p) => {
              const isSelected = p.id === activePresence?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => selectPresence(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition border ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Pending Quotes Display */}
        {pendingQuotes.length > 0 && (
          <div className="space-y-1.5 pl-3 border-l-2 border-zinc-400 dark:border-zinc-600">
            {pendingQuotes.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded"
              >
                <div className="flex items-start gap-1 flex-1 pr-2">
                  <CornerDownRight size={12} className="mt-0.5 shrink-0 opacity-60" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    @{q.sourcePresenceName}:
                  </span>
                  <span className="italic line-clamp-2">“{q.text}”</span>
                </div>
                <button
                  onClick={() => removeQuote(idx)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
                  title="移除引用"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div className="relative border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden focus-within:border-zinc-500 dark:focus-within:border-zinc-400 transition bg-zinc-50/50 dark:bg-zinc-900/50">
          <textarea
            ref={textareaRef}
            rows={2}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              presences.length > 0
                ? `「${activePresence?.name || ''}」(Enter发送，Shift+Enter换行）`
                : '请先添加 Presence 以开始记录...(Enter发送，Shift+Enter换行）'
            }
            className="w-full text-xs font-sans p-3 bg-transparent focus:outline-none resize-none placeholder:text-zinc-400"
          />

          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100/60 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-mono">
              Tab 轮切 Presence
            </span>

            <button
              onClick={handleSend}
              disabled={!content.trim() || !activePresence}
              className="px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded font-medium disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
            >
              <span>发言</span>
              <Send size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
