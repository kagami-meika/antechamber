import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, Moon, Sun, Download, Search, Settings, Info } from 'lucide-react';

interface SidebarProps {
  onOpenPresencesModal: () => void;
  onOpenExportModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAboutModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenPresencesModal,
  onOpenExportModal,
  onOpenSettingsModal,
  onOpenAboutModal,
}) => {
  const {
    cloisters,
    activeCloisterId,
    selectCloister,
    createCloister,
    updateCloister,
    deleteCloister,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    search,
    clearSearch,
    settings,
    updateSettings,
    openConfirm,
  } = useAppStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Resize sidebar logic
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = settings.sidebarWidth || 260;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(200, Math.min(480, startWidth + delta));
      updateSettings({ sidebarWidth: newWidth });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    if (cloisters.some((c) => c.title.toLowerCase() === title.toLowerCase())) {
      alert('已存在同名 Cloister');
      return;
    }
    await createCloister(title);
    setNewTitle('');
    setIsCreating(false);
  };

  const handleStartEdit = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveEdit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const title = editTitle.trim();
    if (!title) return;
    if (cloisters.some((c) => c.id !== id && c.title.toLowerCase() === title.toLowerCase())) {
      alert('已存在同名 Cloister');
      return;
    }
    await updateCloister(id, title);
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirm(
      '删除 Cloister',
      '确认删除该 Cloister 及其所有对话历史与 Presences？此操作不可撤销。',
      () => deleteCloister(id)
    );
  };

  return (
    <aside
      style={{ width: `${settings.sidebarWidth || 260}px` }}
      className="relative shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col h-full select-none"
    >
      {/* Drag handle for resizing */}
      <div
        onMouseDown={startResizing}
        className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-zinc-400/50 transition z-20 ${
          isResizing ? 'bg-zinc-500' : ''
        }`}
      />
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
            Antechamber
          </h1>
          <p className="text-xs text-zinc-500 font-mono">v0.3.1</p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
          title="切换明暗氛围"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="搜索全域对话..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              search(e.target.value);
            }}
            className="w-full text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 pl-8 pr-6 py-1.5 rounded focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 font-sans"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Cloister Section Header */}
      <div className="px-4 py-2 flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <span>Cloisters</span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition"
          title="新建 Cloister"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Cloister List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {isCreating && (
          <form onSubmit={handleCreate} className="p-2 mb-1 border border-zinc-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800">
            <input
              type="text"
              autoFocus
              placeholder="输入廊道名称..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full text-xs bg-transparent border-b border-zinc-300 dark:border-zinc-700 pb-1 mb-2 focus:outline-none"
            />
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-0.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-2 py-0.5 text-xs bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium"
              >
                创建
              </button>
            </div>
          </form>
        )}

        {cloisters.map((cloister) => {
          const isActive = cloister.id === activeCloisterId;
          const isEditing = cloister.id === editingId;

          return (
            <div
              key={cloister.id}
              onClick={() => selectCloister(cloister.id)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition ${
                isActive
                  ? 'bg-zinc-200 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-700 px-1.5 py-0.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded focus:outline-none"
                  />
                  <button
                    onClick={(e) => handleSaveEdit(cloister.id, e)}
                    className="p-1 hover:text-emerald-600"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(null);
                    }}
                    className="p-1 hover:text-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 truncate flex-1 pr-1">
                    <MessageSquare size={13} className="shrink-0 opacity-70" />
                    <span className="truncate">{cloister.title}</span>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition shrink-0">
                    <button
                      onClick={(e) => handleStartEdit(cloister.id, cloister.title, e)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      title="重命名"
                    >
                      <Edit2 size={11} />
                    </button>
                    {cloisters.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(cloister.id, e)}
                        className="p-1 text-zinc-400 hover:text-red-500"
                        title="删除廊道"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Navigation: Presences, Data, Settings, About */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        <button
          onClick={onOpenPresencesModal}
          className="w-full text-left px-2.5 py-1.5 rounded text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-between"
        >
          <span className="font-medium">Presences</span>
          <span className="text-[10px] text-zinc-400 font-mono tracking-tighter">管理</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="w-full text-left px-2.5 py-1.5 rounded text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-between"
        >
          <span className="font-medium">数据备份与导出</span>
          <Download size={12} className="text-zinc-400" />
        </button>

        <div className="pt-1 flex items-center gap-1">
          <button
            onClick={onOpenSettingsModal}
            className="flex-1 text-left px-2.5 py-1.5 rounded text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center gap-2"
          >
            <Settings size={13} className="text-zinc-400" />
            <span className="font-medium">设置</span>
          </button>
          <button
            onClick={onOpenAboutModal}
            className="p-1.5 rounded text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-center"
            title="关于 Antechamber"
          >
            <Info size={13} className="text-zinc-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};
