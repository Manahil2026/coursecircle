"use client";

import React, { useEffect, useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  lastMessage: {
    content: string;
    createdAt: string;
    status: "DRAFT" | "SENT" | "READ";
  } | null;
  updatedAt: string;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/conversations");
        
        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }
        
        const data = await response.json();
        setConversations(data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/pages/inbox/${conversationId}`);
  };

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

  const getUnreadCount = () => {
    return conversations.filter(convo => 
      convo.lastMessage && 
      convo.lastMessage.status === "SENT"
    ).length;
  };

  return (
    <>
      <Sidebar_dashboard />
      <div className="flex h-screen flex-1 pl-16">
        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold mb-4">
              Inbox {getUnreadCount() > 0 && <span className="text-sm bg-[#AAFF45] text-black rounded-full px-2 py-1 ml-2">{getUnreadCount()}</span>}
            </h1>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#B9FF66] text-sm"
            >
              New Message
            </button>
          </div>

          {loading ? (
            <div className="h-screen flex items-center justify-center bg-white">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="mb-4">No conversations yet</p>
              <button 
                onClick={() => setShowNewMessageModal(true)}
                className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#B9FF66] text-sm"
              >
                Start a new conversation
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`p-4 border rounded-md shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 ${
                    conversation.lastMessage?.status === "SENT" ? "border-l-4 border-l-[#AAFF45]" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{conversation.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {conversation.lastMessage ? conversation.lastMessage.content : "No messages yet"}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(conversation.updatedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Placeholder for NewConversationModal component */}
          {showNewMessageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                <h2 className="text-lg font-medium mb-4">New Message</h2>
                <p className="text-gray-600 mb-4">This is a placeholder for the NewConversationModal component.</p>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setShowNewMessageModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
