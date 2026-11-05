import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl w-full max-w-sm overflow-hidden select-none animate-in fade-in zoom-in-95 duration-100">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className={isDestructive ? 'text-amber-500' : 'text-zinc-500'} />
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">{message}</p>
        </div>

        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-xs rounded font-medium transition ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
