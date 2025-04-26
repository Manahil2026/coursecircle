// app/components/messaging/DraftsList.tsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Draft {
  id: string;
  content: string;
  conversationId: string;
  conversationName: string;
  createdAt: string;
  updatedAt: string;
}

interface DraftsListProps {
  drafts: Draft[];
  onSelect: (draftId: string, conversationId: string) => void;
  onDelete: (draftId: string) => void;
  loading: boolean;
}

export default function DraftsList({ drafts, onSelect, onDelete, loading }: DraftsListProps) {
  const router = useRouter();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Function to create a safe HTML preview
  const createHTMLPreview = (html: string) => {
    // Create temporary div
    const temp = document.createElement("div");
    temp.innerHTML = html;
    // Get the text content
    return temp.textContent || temp.innerText || "";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-500 text-center rounded-md">
        <p className="mb-2">No draft messages</p>
        <button 
          onClick={() => router.push("/pages/inbox/new")}
          className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#B9FF66] text-sm"
        >
          Create a new message
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {drafts.map((draft) => (
        <div 
          key={draft.id}
          className="p-4 border rounded-md shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 relative"
        >
          <div 
            className="pr-8" 
            onClick={() => onSelect(draft.id, draft.conversationId)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">
                  To: {draft.conversationName}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {createHTMLPreview(draft.content) || "No content"}
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  Last edited: {formatTimestamp(draft.updatedAt)}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(draft.id);
            }}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <Image src="/asset/delete_icon.svg" alt="Delete" width={16} height={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
