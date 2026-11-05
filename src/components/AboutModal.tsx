import React from 'react';
import { X, Sparkles, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col select-none">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">关于 Antechamber</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="text-center space-y-1.5 py-2">
            <h3 className="text-base font-bold tracking-wider text-zinc-900 dark:text-zinc-100">ANTECHAMBER</h3>
            <p className="text-[11px] font-mono text-zinc-400">版本 v0.3.1</p>
            <p className="text-zinc-500 text-xs max-w-xs mx-auto leading-relaxed pt-1">
              极简主义自省场域与多向自我对话空间。
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              • <strong>Cloister (廊道)</strong>：各自独立的心灵论题场域。
            </p>
            <p>
              • <strong>Presence (临在者)</strong>：代表探索过程中的多重思维切面。
            </p>
            <p>
              • <strong>片段引用</strong>：选取历史文本快速附带上下文，追踪思考推演。
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart size={12} className="text-red-500 fill-red-500 inline" />
              <span>for Inner Dialogue</span>
            </div>
            <a
              href="https://github.com/kagami-meika/antechamber"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <span>GitHub 仓库</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/20 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
