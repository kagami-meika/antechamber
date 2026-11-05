import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { exportJson, exportJsonl, exportTxt, restoreJson } = useAppStore();
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const isTauri = () => typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  const saveContentToFile = async (
    content: string,
    defaultPath: string,
    extension: string,
    mimeType: string
  ) => {
    if (isTauri()) {
      try {
        const saved = await invoke<boolean>('save_file_dialog', { 
            defaultName: defaultPath,
            extension: extension,
            content: content 
        });
        return saved;
      } catch (err: any) {
        console.error('Tauri save dialog error:', err);
      }
    }

    // Web / Fallback file download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultPath;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  };

  const handleExportJson = async () => {
    try {
      const data = await exportJson();
      const filename = `antechamber-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const saved = await saveContentToFile(data, filename, 'json', 'application/json');
      if (saved) {
        setStatus({ type: 'success', message: '已成功导出 JSON 完整备份文件' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || '导出失败' });
    }
  };

  const handleExportJsonl = async () => {
    try {
      const data = await exportJsonl();
      const filename = `antechamber-messages-${new Date().toISOString().slice(0, 10)}.jsonl`;
      const saved = await saveContentToFile(data, filename, 'jsonl', 'application/x-ndjson');
      if (saved) {
        setStatus({ type: 'success', message: '已成功导出 JSONL 消息序列文件' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || '导出失败' });
    }
  };

  const handleExportTxt = async () => {
    try {
      const data = await exportTxt();
      const filename = `antechamber-dialogue-${new Date().toISOString().slice(0, 10)}.txt`;
      const saved = await saveContentToFile(data, filename, 'txt', 'text/plain;charset=utf-8');
      if (saved) {
        setStatus({ type: 'success', message: '已成功导出 TXT 人类可读文本' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || '导出失败' });
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    useAppStore.getState().openConfirm(
      '恢复数据备份',
      '恢复备份将会覆盖当前的全部廊道、临在者与对话数据。确定继续？',
      () => {
        setImporting(true);
        setStatus(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const text = event.target?.result as string;
            await restoreJson(text);
            setStatus({ type: 'success', message: '数据已成功从备份恢复' });
          } catch (err: any) {
            setStatus({ type: 'error', message: `恢复失败: ${err.message || '格式无效'}` });
          } finally {
            setImporting(false);
          }
        };
        reader.onerror = () => {
          setStatus({ type: 'error', message: '读取文件失败' });
          setImporting(false);
        };
        reader.readAsText(file);
      }
    );
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">数据备份与导出</h2>
            <p className="text-xs text-zinc-500 mt-0.5">本地全量持久化，无网络依赖，随时备份与还原</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {status && (
            <div
              className={`p-3 rounded text-xs flex items-center gap-2 ${
                status.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Export Options */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">数据导出</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={handleExportJson}
                className="p-3 border border-zinc-200 dark:border-zinc-800 rounded text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">JSON 完整备份</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    包含所有廊道、临在者、对话、引用与时间戳，用于完整数据迁移和还原
                  </div>
                </div>
                <Download size={14} className="text-zinc-400 shrink-0 ml-2" />
              </button>

              <button
                onClick={handleExportJsonl}
                className="p-3 border border-zinc-200 dark:border-zinc-800 rounded text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">JSONL 消息流</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">一行一条消息，便于外部数据脚本处理与分析</div>
                </div>
                <Download size={14} className="text-zinc-400 shrink-0 ml-2" />
              </button>

              <button
                onClick={handleExportTxt}
                className="p-3 border border-zinc-200 dark:border-zinc-800 rounded text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">TXT 纯文本记录</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">按时间排序的清晰人类可读文本，包含身份及引用标注</div>
                </div>
                <Download size={14} className="text-zinc-400 shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Import / Restore Section */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">数据恢复</h3>
            <label className="p-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded text-left hover:border-zinc-400 dark:hover:border-zinc-600 cursor-pointer transition flex items-center justify-between block">
              <div>
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">从 JSON 备份恢复数据</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  选择此前导出的 .json 完整备份文件进行恢复（将覆盖当前场域数据）
                </div>
              </div>
              <div className="px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 shrink-0 ml-2">
                <Upload size={12} />
                <span>{importing ? '恢复中...' : '选择文件'}</span>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                disabled={importing}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
