import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Sliders, Type, Clock } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useAppStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">设置 (Settings)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs select-none">
          {/* Typography Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
              <Type size={13} />
              <span>排版与字体 (Typography)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1">
                <label className="text-zinc-600 dark:text-zinc-400">消息正文字号 (px)</label>
                <input
                  type="number"
                  min={11}
                  max={24}
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: Number(e.target.value) || 13 })}
                  className="w-full px-2 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600 dark:text-zinc-400">引用片段字号 (px)</label>
                <input
                  type="number"
                  min={10}
                  max={20}
                  value={settings.quoteFontSize}
                  onChange={(e) => updateSettings({ quoteFontSize: Number(e.target.value) || 12 })}
                  className="w-full px-2 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-zinc-600 dark:text-zinc-400">消息正文字体 (Font Family)</label>
                <input
                  type="text"
                  placeholder="例: Inter, 'Microsoft YaHei', sans-serif"
                  value={settings.fontFamily}
                  onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                  className="w-full px-2 py-1 font-mono text-[11px] bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none"
                />
                <span className="text-[10px] text-zinc-400">
                  支持自定义英文和中文字体组合，如：<code className="text-zinc-500">"Helvetica Neue", "PingFang SC", sans-serif</code>
                </span>
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-zinc-600 dark:text-zinc-400">引用片段字体 (Quote Font Family)</label>
                <input
                  type="text"
                  placeholder="例: 'JetBrains Mono', 'PingFang SC', monospace"
                  value={settings.quoteFontFamily}
                  onChange={(e) => updateSettings({ quoteFontFamily: e.target.value })}
                  className="w-full px-2 py-1 font-mono text-[11px] bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Timestamp Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
              <Clock size={13} />
              <span>时间戳设置 (Timestamp)</span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200">显示消息时间戳</div>
                  <div className="text-[11px] text-zinc-400">在发言者头部右侧显示发言时间</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showTimestamp}
                  onChange={(e) => updateSettings({ showTimestamp: e.target.checked })}
                  className="w-4 h-4 rounded text-zinc-900 border-zinc-300 dark:border-zinc-600 focus:ring-0 cursor-pointer"
                />
              </div>

              {settings.showTimestamp && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 space-y-1">
                  <label className="text-zinc-600 dark:text-zinc-400">时间戳格式</label>
                  <select
                    value={settings.timestampFormat}
                    onChange={(e) => updateSettings({ timestampFormat: e.target.value as any })}
                    className="w-full px-2 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none"
                  >
                    <option value="time-only">仅显示时间 (例: 14:30:15)</option>
                    <option value="full">完整日期与时间 (例: 2026-11-05 14:30:15)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
