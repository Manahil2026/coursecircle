import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
}

interface LastMessage {
  content: string;
  createdAt: string;
  status: "DRAFT" | "SENT" | "READ";
}

interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  participants: Participant[];
  lastMessage: LastMessage | null;
  updatedAt: string;
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedId,
  onSelect,
}) => {
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

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="mb-4">No conversations yet</p>
        <button
          onClick={() => router.push("/pages/inbox/new")}
          className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#B9FF66] text-sm"
        >
          Start a new conversation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          className={`p-4 border rounded-md shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 ${
            selectedId === conversation.id
              ? "border-[#AAFF45] bg-gray-50"
              : conversation.lastMessage?.status === "SENT"
              ? "border-l-4 border-l-[#AAFF45]"
              : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{conversation.name}</h3>
              <p className="text-sm text-gray-600 truncate">
                {conversation.lastMessage
                  ? conversation.lastMessage.content
                  : "No messages yet"}
              </p>
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {formatTimestamp(conversation.updatedAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationsList;
