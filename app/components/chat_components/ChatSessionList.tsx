import React, { useState } from "react";
import Image from "next/image";

interface Session { id: string; title?: string; createdAt: string }
interface Props { sessions: Session[]; onSelect: (id: string) => void; onNew: () => void; onRename: (id: string, title: string) => void; onDelete: (id: string) => void; }

export default function ChatSessionList({ sessions, onSelect, onNew, onRename, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  return (
    <div className="w-48 border-r p-2">
      <button onClick={onNew} className="w-full mb-2 p-1 bg-[#AAFF45] text-black rounded">+ New Chat</button>
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
              <button onClick={() => onSelect(s.id)} className="text-left flex-1 p-1 hover:opacity-70 transition-opacity">
                {s.title || new Date(s.createdAt).toLocaleString()}
              </button>
            )}
            <div className="flex space-x-1">
              <button 
                onClick={() => { setEditingId(s.id); setDraftTitle(s.title || ''); }} 
                title="Rename"
                className="hover:opacity-70 transition-opacity"
              >
                <Image src="/asset/edit_icon.svg" alt="Edit" width={17} height={17} />
              </button>
              <button 
                onClick={() => onDelete(s.id)} 
                title="Delete"
                className="hover:opacity-70 transition-opacity"
              >
                <Image src="/asset/delete_icon.svg" alt="Delete" width={17} height={17} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}