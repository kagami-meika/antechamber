import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Presence } from '../types/schemas';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';

interface PresencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#2563eb', // blue
  '#db2777', // pink
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // purple
  '#4b5563', // gray
];

export const PresencesModal: React.FC<PresencesModalProps> = ({ isOpen, onClose }) => {
  const { presences, createPresence, updatePresence, deletePresence } = useAppStore();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createPresence(name.trim(), description.trim(), color);
    setName('');
    setDescription('');
    setColor(PRESET_COLORS[0]);
    setIsCreating(false);
  };

  const handleStartEdit = (p: Presence) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDesc(p.description);
    setEditColor(p.color);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updatePresence(id, editName.trim(), editDesc.trim(), editColor);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Presences</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              每个 Presence 代表你的某种自我侧面，无需完整人格定义。
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {presences.map((p) => {
            const isEditing = p.id === editingId;

            if (isEditing) {
              return (
                <div key={p.id} className="p-3 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Presence 名称"
                      className="flex-1 text-xs px-2 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-4 h-4 rounded-full border ${editColor.toLowerCase() === c.toLowerCase() ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent'}`}
                        />
                      ))}
                      {/* Native HTML5 Color Picker */}
                      <label
                        className="relative w-5 h-5 rounded-full overflow-hidden cursor-pointer border border-zinc-300 dark:border-zinc-600 hover:scale-105 transition flex items-center justify-center"
                        title="自定义颜色"
                        style={{ backgroundColor: editColor || '#000000' }}
                      >
                        <input
                          type="color"
                          value={editColor.startsWith('#') && (editColor.length === 7 || editColor.length === 4) ? editColor : '#2563eb'}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        placeholder="#hex"
                        className="w-16 font-mono text-[11px] px-1.5 py-0.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none"
                      />
                    </div>
                  </div>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="简要描述（可选）"
                    rows={2}
                    className="w-full text-xs px-2 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-2.5 py-1 text-zinc-500 hover:text-zinc-700"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleSaveEdit(p.id)}
                      className="text-xs px-3 py-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium"
                    >
                      保存
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={p.id}
                className="flex items-start justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                    {p.description && (
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{p.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    title="编辑"
                  >
                    <Edit2 size={13} />
                  </button>
                  {presences.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm(`确认删除【${p.name}】？`)) {
                          deletePresence(p.id);
                        }
                      }}
                      className="p-1 text-zinc-400 hover:text-red-500"
                      title="删除"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Create new Presence form */}
          {isCreating ? (
            <form onSubmit={handleCreate} className="p-3 border border-zinc-300 dark:border-zinc-700 rounded bg-zinc-50 dark:bg-zinc-800 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Presence 名称..."
                  className="flex-1 text-xs px-2 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-4 h-4 rounded-full border ${color.toLowerCase() === c.toLowerCase() ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent'}`}
                    />
                  ))}
                  {/* Native HTML5 Color Picker */}
                  <label
                    className="relative w-5 h-5 rounded-full overflow-hidden cursor-pointer border border-zinc-300 dark:border-zinc-600 hover:scale-105 transition flex items-center justify-center"
                    title="自定义颜色"
                    style={{ backgroundColor: color || '#000000' }}
                  >
                    <input
                      type="color"
                      value={color.startsWith('#') && (color.length === 7 || color.length === 4) ? color : '#2563eb'}
                      onChange={(e) => setColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#hex"
                    className="w-16 font-mono text-[11px] px-1.5 py-0.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none"
                  />
                </div>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="自我侧面特征/简述（可选）"
                rows={2}
                className="w-full text-xs px-2 py-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded focus:outline-none resize-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs px-2.5 py-1 text-zinc-500 hover:text-zinc-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="text-xs px-3 py-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded font-medium"
                >
                  添加 Presence
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-400 flex items-center justify-center gap-1 transition"
            >
              <Plus size={13} />
              <span>添加新 Presence</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
