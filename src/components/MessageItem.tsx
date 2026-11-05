import React, { useState } from 'react';
import { Message, Presence } from '../types/schemas';
import { useAppStore } from '../store/useAppStore';
import { Quote, Edit2, Trash2, History, Copy, Check } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  presence?: Presence;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onQuoteText: (quoteText: string, sourceMsg: Message) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  presence,
  isFirstInGroup = true,
  isLastInGroup = true,
  onQuoteText,
}) => {
  const { editMessage, deleteMessage, settings, openConfirm } = useAppStore();
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

  const handleDelete = () => {
    openConfirm('删除消息', '确认删除此消息？删除后将在时间线中标记为已删除。', () => {
      deleteMessage(message.id);
    });
  };

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const timeDisplay = settings.showTimestamp
    ? settings.timestampFormat === 'time-only'
      ? formattedTime
      : new Date(message.createdAt).toLocaleString()
    : null;

  if (message.isDeleted) {
    return (
      <div className="relative pl-6 pr-4 py-2 text-xs italic text-zinc-400 dark:text-zinc-600">
        <div
          className="absolute left-2.5 top-0 bottom-0 w-[3px]"
          style={{ backgroundColor: presence?.color || '#71717a' }}
        />
        [此消息已删除]
      </div>
    );
  }

  return (
    <div
      className={`group relative pl-6 pr-4 transition hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 ${
        isFirstInGroup ? 'pt-2.5 pb-1' : isLastInGroup ? 'pt-1 pb-2.5' : 'py-1'
      }`}
      onMouseUp={handleMouseUp}
    >
      {/* Continuous Vertical Bar */}
      <div
        className="absolute left-2.5 top-0 bottom-0 w-[3px]"
        style={{
          backgroundColor: presence?.color || '#71717a',
          borderTopLeftRadius: isFirstInGroup ? '2px' : '0',
          borderTopRightRadius: isFirstInGroup ? '2px' : '0',
          borderBottomLeftRadius: isLastInGroup ? '2px' : '0',
          borderBottomRightRadius: isLastInGroup ? '2px' : '0',
        }}
      />

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

      {/* Presence Identity and Meta Header (only show when first in group) */}
      {isFirstInGroup && (
        <div className="flex items-center justify-between gap-2 mb-1 select-none">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold tracking-tight"
              style={{ color: presence?.color || '#71717a' }}
            >
              {presence?.name || '未知身份'}
            </span>
            {presence?.description && (
              <span className="text-[11px] text-zinc-400 truncate max-w-xs hidden sm:inline">
                · {presence.description}
              </span>
            )}
            {timeDisplay && (
              <span className="text-[10px] font-mono text-zinc-400">{timeDisplay}</span>
            )}
            {message.updatedAt && (
              <span className="text-[10px] text-zinc-400 italic">(已编辑)</span>
            )}
          </div>

          {/* Interaction Toolbar */}
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
              onClick={handleDelete}
              className="p-1 text-zinc-400 hover:text-red-500 rounded"
              title="删除"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Show timestamp on hover if consecutive */}
      {!isFirstInGroup && (
        <div className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition select-none">
          {timeDisplay && (
            <span className="text-[10px] font-mono text-zinc-400 mr-2">{timeDisplay}</span>
          )}
          <button
            onClick={() => onQuoteText(message.content, message)}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
            title="引用整条消息"
          >
            <Quote size={12} />
          </button>
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
            onClick={handleDelete}
            className="p-1 text-zinc-400 hover:text-red-500 rounded"
            title="删除"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Attached Quotes */}
      {message.quotes && message.quotes.length > 0 && (
        <div className="space-y-1 mb-1.5 pl-2.5 border-l-2 border-zinc-200 dark:border-zinc-700">
          {message.quotes.map((q, idx) => (
            <div
              key={idx}
              className="text-zinc-500 dark:text-zinc-400 leading-normal"
              style={{
                fontSize: `${settings.quoteFontSize}px`,
                fontFamily: settings.quoteFontFamily,
              }}
            >
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 mr-1.5">
                @{q.sourcePresenceName}:
              </span>
              <span className="italic select-text">“{q.text}”</span>
            </div>
          ))}
        </div>
      )}

      {/* Message Content / Inline Edit Form */}
      {isEditing ? (
        <div className="mt-1 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full text-xs p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-none focus:border-zinc-500 resize-none font-sans leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs px-2.5 py-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              取消
            </button>
            <button
              onClick={handleSaveEdit}
              className="text-xs px-3 py-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium"
            >
              保存修改
            </button>
          </div>
        </div>
      ) : (
        <div
          className="text-zinc-800 dark:text-zinc-200 leading-relaxed break-words whitespace-pre-wrap select-text"
          style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontFamily,
          }}
        >
          {message.content}
        </div>
      )}

      {/* Edit History Drawer */}
      {showHistory && message.editHistory && message.editHistory.length > 0 && (
        <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-[11px] space-y-1.5">
          <div className="font-semibold text-zinc-500">修改历史：</div>
          {message.editHistory.map((h, i) => (
            <div key={i} className="pl-2 border-l border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
              <span className="text-[10px] font-mono text-zinc-400">
                {new Date(h.editedAt).toLocaleTimeString()}
              </span>
              <p className="mt-0.5 line-through opacity-75">{h.previousContent}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
