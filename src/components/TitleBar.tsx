import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const TitleBar: React.FC = () => {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  const handleMinimize = async () => {
    if (isTauri) {
      await getCurrentWindow().minimize();
    }
  };

  const handleToggleMaximize = async () => {
    if (isTauri) {
      await getCurrentWindow().toggleMaximize();
    }
  };

  const handleClose = async () => {
    if (isTauri) {
      await getCurrentWindow().close();
    }
  };

  return (
    <div
      data-tauri-drag-region
      className="h-8 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 select-none cursor-default"
    >
      <div className="px-3 text-[11px] font-medium text-zinc-500 tracking-wide flex items-center gap-2" data-tauri-drag-region>
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
        <span>Antechamber</span>
      </div>
      <div className="flex h-full">
        <button
          onClick={handleMinimize}
          className="px-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center"
          title="最小化"
        >
          <Minus size={13} className="text-zinc-500 dark:text-zinc-400" />
        </button>
        <button
          onClick={handleToggleMaximize}
          className="px-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center"
          title="最大化 / 还原"
        >
          <Square size={11} className="text-zinc-500 dark:text-zinc-400" />
        </button>
        <button
          onClick={handleClose}
          className="px-3 hover:bg-red-500 hover:text-white transition flex items-center justify-center group"
          title="关闭"
        >
          <X size={13} className="text-zinc-500 dark:text-zinc-400 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
};
