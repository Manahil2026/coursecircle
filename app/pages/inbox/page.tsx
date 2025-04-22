"use client";

import React, { useEffect, useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import NewConversationModal from "@/app/components/messaging/NewConversationModal";
import AnnouncementModal from "@/app/components/messaging/AnnouncementModal";

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

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const isProf = user?.publicMetadata?.role === "prof";

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

    // Fetch courses if user is a professor
    if (isProf) {
      const fetchCourses = async () => {
        try {
          const response = await fetch("/api/courses/professor");
          if (response.ok) {
            const data = await response.json();
            setCourses(data);
          }
        } catch (err) {
          console.error("Error fetching professor courses:", err);
        }
      };
      fetchCourses();
    }
  }, [isProf]);

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

  const handleNewConversation = (conversationId: string) => {
    router.push(`/pages/inbox/${conversationId}`);
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
            <div className="flex gap-2">
              <button 
                onClick={() => setShowNewMessageModal(true)}
                className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#B9FF66] text-sm"
              >
                New Message
              </button>
              {isProf && (
                <button 
                  onClick={() => setShowAnnouncementModal(true)}
                  className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#B9FF66] text-sm"
                >
                  Announcement
                </button>
              )}
            </div>
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
                    selectedConversationId === conversation.id
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
          )}

          {showNewMessageModal && (
            <NewConversationModal 
              onClose={() => setShowNewMessageModal(false)} 
              courses={courses}
              onSuccess={handleNewConversation}
            />
          )}

          {showAnnouncementModal && (
            <AnnouncementModal 
              onClose={() => setShowAnnouncementModal(false)}
              courses={courses}
              onSuccess={handleNewConversation}
            />
          )}
        </main>
      </div>
    </>
  );
}
