import React from 'react';
import { Minus, Square, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const TitleBar: React.FC = () => {
  const handleMouseDown = async (e: React.MouseEvent) => {
    // Only drag on left click and when clicking the bar itself or drag-region
    if (e.button === 0 && (e.target as HTMLElement).closest('[data-tauri-drag-region]')) {
      try {
        const appWin = getCurrentWindow();
        await appWin.startDragging();
      } catch (err) {
        console.error('Failed to drag window:', err);
      }
    }
  };

  const handleDoubleClick = async (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-tauri-drag-region]')) {
      try {
        const appWin = getCurrentWindow();
        await appWin.toggleMaximize();
      } catch (err) {
        console.error('Failed to toggle maximize on double click:', err);
      }
    }
  };

  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const appWin = getCurrentWindow();
      await appWin.minimize();
    } catch (err) {
      console.error('Failed to minimize window:', err);
    }
  };

  const handleToggleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const appWin = getCurrentWindow();
      await appWin.toggleMaximize();
    } catch (err) {
      console.error('Failed to toggle maximize window:', err);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const appWin = getCurrentWindow();
      await appWin.close();
    } catch (err) {
      console.error('Failed to close window:', err);
    }
  };

  return (
    <div
      data-tauri-drag-region
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className="h-8 shrink-0 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 select-none cursor-default z-50"
    >
      <div
        data-tauri-drag-region
        className="flex-1 h-full px-3 text-[11px] font-medium text-zinc-500 tracking-wide flex items-center gap-2 cursor-default"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 pointer-events-none" />
        <span className="pointer-events-none">Antechamber</span>
      </div>
      <div className="flex h-full no-drag">
        <button
          onClick={handleMinimize}
          className="px-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center"
          title="最小化"
        >
          <Minus size={13} className="text-zinc-500 dark:text-zinc-400 pointer-events-none" />
        </button>
        <button
          onClick={handleToggleMaximize}
          className="px-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center"
          title="最大化 / 还原"
        >
          <Square size={11} className="text-zinc-500 dark:text-zinc-400 pointer-events-none" />
        </button>
        <button
          onClick={handleClose}
          className="px-3 hover:bg-red-500 hover:text-white transition flex items-center justify-center group"
          title="关闭"
        >
          <X size={13} className="text-zinc-500 dark:text-zinc-400 group-hover:text-white pointer-events-none" />
        </button>
      </div>
    </div>
  );
};
