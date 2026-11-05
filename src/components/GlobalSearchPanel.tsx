import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Search, CornerDownLeft, ExternalLink, Calendar } from 'lucide-react';

export const GlobalSearchPanel: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    search,
    clearSearch,
    searchResults,
    selectCloister,
    settings,
  } = useAppStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      search(searchQuery);
    }
  };

  const handleJumpToMessage = async (cloisterId: string) => {
    await selectCloister(cloisterId);
    clearSearch();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 font-sans">
      {/* Top Search Area */}
      <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-zinc-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                全域搜索 (Global Search)
              </h2>
            </div>
            <button
              onClick={clearSearch}
              className="text-xs px-2.5 py-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition flex items-center gap-1"
            >
              <X size={13} />
              <span>退出搜索</span>
            </button>
          </div>

          {/* Multiline Search Input */}
          <div className="relative border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 shadow-sm focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition">
            <textarea
              ref={textareaRef}
              rows={2}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                search(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="输入关键词搜索所有廊道与临在者对话... (Enter 搜索，Shift+Enter 换行)"
              className="w-full text-xs p-3 pr-20 bg-transparent resize-y min-h-[48px] max-h-36 focus:outline-none leading-relaxed text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  title="清空"
                >
                  <X size={14} />
                </button>
              )}
              <button
                onClick={() => search(searchQuery)}
                className="px-2.5 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] rounded font-medium flex items-center gap-1"
              >
                <span>搜索</span>
                <CornerDownLeft size={10} />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between">
            <span>支持多行关键词检索；匹配结果以“{`{Cloister} - {Presence}`}”独立溯源呈现。</span>
            {searchResults !== null && (
              <span className="font-mono font-medium text-zinc-600 dark:text-zinc-300">
                找到 {searchResults.length} 条匹配
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search Results List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {searchResults === null || searchResults.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-400">
              {searchQuery.trim() ? '未找到符合条件的对话内容' : '在上方输入文字开启全域搜索'}
            </div>
          ) : (
            searchResults.map(({ message, cloisterTitle, presenceName }) => {
              const formattedDate = new Date(message.createdAt).toLocaleString();
              return (
                <div
                  key={message.id}
                  className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm space-y-2 group"
                >
                  {/* Result Header: {Cloister} - {Presence} */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {`{${cloisterTitle}} - {${presenceName}}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {formattedDate}
                      </span>
                      <button
                        onClick={() => handleJumpToMessage(message.cloisterId)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1 opacity-0 group-hover:opacity-100"
                        title="打开该 Cloister"
                      >
                        <span>进入廊道</span>
                        <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Quotes attached if any */}
                  {message.quotes && message.quotes.length > 0 && (
                    <div className="pl-2.5 border-l-2 border-zinc-200 dark:border-zinc-700 space-y-0.5">
                      {message.quotes.map((q, idx) => (
                        <div key={idx} className="text-[11px] text-zinc-400 italic">
                          引用 @{q.sourcePresenceName}: “{q.text}”
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className="text-zinc-800 dark:text-zinc-200 leading-relaxed break-words whitespace-pre-wrap font-sans"
                    style={{
                      fontSize: `${settings.fontSize}px`,
                      fontFamily: settings.fontFamily,
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
