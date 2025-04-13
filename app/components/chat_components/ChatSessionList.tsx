import React, { useState } from "react";

interface Session { id: string; title?: string; createdAt: string }
interface Props { sessions: Session[]; onSelect: (id: string) => void; onNew: () => void; onRename: (id: string, title: string) => void; onDelete: (id: string) => void; }

export default function ChatSessionList({ sessions, onSelect, onNew, onRename, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  return (
    <div className="w-60 border-r p-2">
      <button onClick={onNew} className="w-full mb-2 p-2 bg-green-500 text-white rounded">+ New Chat</button>
      <ul>
        {sessions.map(s => (
          <li key={s.id} className="flex items-center justify-between mb-1">
            {editingId === s.id ? (
              <input
                className="flex-1 p-1 border rounded"
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
                onBlur={() => { onRename(s.id, draftTitle); setEditingId(null); }}
                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                autoFocus
              />
            ) : (
              <button onClick={() => onSelect(s.id)} className="text-left flex-1 p-1 hover:bg-gray-100 rounded">
                {s.title || new Date(s.createdAt).toLocaleString()}
              </button>
            )}
            <div className="flex space-x-1">
              <button onClick={() => { setEditingId(s.id); setDraftTitle(s.title || ''); }} title="Rename">✏️</button>
              <button onClick={() => onDelete(s.id)} title="Delete">🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}