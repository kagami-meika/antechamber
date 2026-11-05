import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, Moon, Sun, Download, Search } from 'lucide-react';

interface SidebarProps {
  onOpenPresencesModal: () => void;
  onOpenExportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenPresencesModal, onOpenExportModal }) => {
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
  } = useAppStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createCloister(newTitle.trim());
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
    if (!editTitle.trim()) return;
    await updateCloister(id, editTitle.trim());
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确认删除该廊道及其对话历史？此操作不可撤销。')) {
      await deleteCloister(id);
    }
  };

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
            Antechamber
          </h1>
          <p className="text-xs text-zinc-500 font-mono">v0.1.0</p>
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
        <span>Cloister (廊道)</span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition"
          title="新建廊道"
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

      {/* Footer Navigation: Presences & Data management */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
        <button
          onClick={onOpenPresencesModal}
          className="w-full text-left px-2.5 py-1.5 rounded text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-between"
        >
          <span className="font-medium">Presences (临在者)</span>
          <span className="text-[10px] text-zinc-400 font-mono tracking-tighter">管理</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="w-full text-left px-2.5 py-1.5 rounded text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center justify-between"
        >
          <span className="font-medium">数据备份与导出</span>
          <Download size={12} className="text-zinc-400" />
        </button>
      </div>
    </aside>
  );
};
