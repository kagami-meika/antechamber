import React, { useState } from 'react';
import { Message, Presence } from '../types/schemas';
import { useAppStore } from '../store/useAppStore';
import { Quote, Edit2, Trash2, History, Copy, Check } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  presence?: Presence;
  onQuoteText: (quoteText: string, sourceMsg: Message) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, presence, onQuoteText }) => {
  const { editMessage, deleteMessage } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showHistory, setShowHistory] = useState(false);

  // Selection popup menu state
  const [selectionMenu, setSelectionMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleMouseUp = () => {
    if (isEditing) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const selectedText = selection.toString().trim();
      if (selectedText) {
        // Calculate position for the floating menu
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionMenu({
          visible: true,
          x: Math.max(10, rect.left + rect.width / 2),
          y: rect.top - 8,
          text: selectedText,
        });
        return;
      }
    }
    // If click or collapsed selection, dismiss menu
    setSelectionMenu(null);
  };

  const handleActionQuote = () => {
    if (selectionMenu?.text) {
      onQuoteText(selectionMenu.text, message);
      window.getSelection()?.removeAllRanges();
      setSelectionMenu(null);
    }
  };

  const handleActionCopy = async () => {
    if (selectionMenu?.text) {
      await navigator.clipboard.writeText(selectionMenu.text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setSelectionMenu(null);
        window.getSelection()?.removeAllRanges();
      }, 600);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    await editMessage(message.id, editContent.trim());
    setIsEditing(false);
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (message.isDeleted) {
    return (
      <div className="py-2.5 px-4 text-xs italic text-zinc-400 dark:text-zinc-600 border-l-2 border-zinc-200 dark:border-zinc-800">
        [此消息已删除]
      </div>
    );
  }

  return (
    <div
      className="group relative py-3 px-4 transition hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 border-l-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
      onMouseUp={handleMouseUp}
    >
      {/* Floating Selection Action Menu */}
      {selectionMenu?.visible && (
        <div
          style={{
            position: 'fixed',
            left: `${selectionMenu.x}px`,
            top: `${selectionMenu.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md shadow-lg py-1 px-1.5 flex items-center gap-1 text-[11px] font-sans animate-in fade-in zoom-in-95 duration-100 select-none"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleActionQuote}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
          >
            <Quote size={11} />
            <span>引用</span>
          </button>
          <div className="w-[1px] h-3 bg-zinc-700 dark:bg-zinc-300" />
          <button
            onClick={handleActionCopy}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
        </div>
      )}

      {/* Presence Identity and Meta Header */}
      <div className="flex items-center justify-between gap-2 mb-1.5 select-none">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: presence?.color || '#a1a1aa' }}
          />
          <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {presence?.name || '未知身份'}
          </span>
          {presence?.description && (
            <span className="text-[11px] text-zinc-400 truncate max-w-xs hidden sm:inline">
              · {presence.description}
            </span>
          )}
          <span className="text-[10px] font-mono text-zinc-400">{formattedTime}</span>
          {message.updatedAt && (
            <span className="text-[10px] text-zinc-400 italic">
              (已编辑)
            </span>
          )}
        </div>

        {/* Quiet Interaction Toolbar */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition">
          <button
            onClick={() => onQuoteText(message.content, message)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
            title="引用整条消息"
          >
            <Quote size={12} />
          </button>
          {message.editHistory && message.editHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
              title="查看修改历史"
            >
              <History size={12} />
            </button>
          )}
          <button
            onClick={() => {
              setIsEditing(true);
              setEditContent(message.content);
            }}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
            title="编辑"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={() => {
              if (confirm('确认删除此消息？')) {
                deleteMessage(message.id);
              }
            }}
            className="p-1 text-zinc-400 hover:text-red-500 rounded"
            title="删除"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Attached Quotes */}
      {message.quotes && message.quotes.length > 0 && (
        <div className="space-y-1.5 mb-2 pl-3 border-l-2 border-zinc-300 dark:border-zinc-700">
          {message.quotes.map((q, idx) => (
            <div key={idx} className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              <span className="font-medium text-zinc-700 dark:text-zinc-300 mr-1.5">
                @{q.sourcePresenceName}:
              </span>
              <span className="italic select-text">“{q.text}”</span>
            </div>
          ))}
        </div>
      )}

      {/* Message Content or Inline Editor */}
      {isEditing ? (
        <div className="mt-1 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            autoFocus
            className="w-full text-xs font-sans p-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-none focus:border-zinc-500 resize-y"
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              取消
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-2.5 py-0.5 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium"
            >
              保存修改
            </button>
          </div>
        </div>
      ) : (
        <div className="text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-sans select-text">
          {message.content}
        </div>
      )}

      {/* Revision History Collapsible */}
      {showHistory && message.editHistory && message.editHistory.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">修改历史：</div>
          {message.editHistory.map((hist, idx) => (
            <div key={idx} className="pl-2 border-l border-zinc-300 dark:border-zinc-700">
              <span className="font-mono text-[10px] text-zinc-500 mr-2">
                {new Date(hist.editedAt).toLocaleTimeString()}
              </span>
              <span className="line-through opacity-70">{hist.previousContent}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
