// app/pages/inbox/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  status: "DRAFT" | "SENT" | "READ";
}

interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  isAnnouncement: boolean;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
  }[];
  lastMessage: Message | null;
  updatedAt: string;
}

export default function InboxPage() {
  // State for conversations
  const [directConversations, setDirectConversations] = useState<Conversation[]>([]);
  const [announcements, setAnnouncements] = useState<Conversation[]>([]);
  
  // State for pagination
  const [directPage, setDirectPage] = useState(1);
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [hasMoreDirect, setHasMoreDirect] = useState(false);
  const [hasMoreAnnouncements, setHasMoreAnnouncements] = useState(false);
  
  // Other states
  const [loading, setLoading] = useState(true);
  const [directUnreadCount, setDirectUnreadCount] = useState(0);
  const [announcementUnreadCount, setAnnouncementUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useUser();
  const isProf = user?.publicMetadata?.role === "prof";
  
  const CONVERSATIONS_PER_PAGE = 8;

  // Fetch conversations with pagination
  const fetchConversations = async (page: number = 1, isAnnouncement: boolean = false) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/conversations?page=${page}&limit=${CONVERSATIONS_PER_PAGE}&isAnnouncement=${isAnnouncement}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      
      const data = await response.json();
      
      if (isAnnouncement) {
        if (page === 1) {
          setAnnouncements(data.conversations);
        } else {
          setAnnouncements(prev => [...prev, ...data.conversations]);
        }
        setHasMoreAnnouncements(data.hasMore);
      } else {
        if (page === 1) {
          setDirectConversations(data.conversations);
        } else {
          setDirectConversations(prev => [...prev, ...data.conversations]);
        }
        setHasMoreDirect(data.hasMore);
      }
      
      // Update unread counts
      if (page === 1) {
        if (isAnnouncement) {
          setAnnouncementUnreadCount(data.unreadCount || 0);
        } else {
          setDirectUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    // Fetch both types of conversations
    fetchConversations(1, false);
    fetchConversations(1, true);
    
    // Set up a refresh interval to periodically check for new messages
    const intervalId = setInterval(() => {
      fetchConversations(1, false);
      fetchConversations(1, true);
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
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

  // Render conversation item
  const renderConversationItem = (conversation: Conversation) => (
    <div 
      key={conversation.id}
      onClick={() => handleConversationSelect(conversation.id)}
      className={`p-4 border rounded-md shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 ${
        conversation.lastMessage?.status === "SENT"
          ? "border-l-4 border-l-[#AAFF45]"
          : ""
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{conversation.name}</h3>
          <p className="text-sm text-gray-600 truncate">
            {conversation.lastMessage
              ? conversation.lastMessage.content.replace(/<[^>]*>?/gm, '')
              : "No messages yet"}
          </p>
        </div>
        <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
          {formatTimestamp(conversation.updatedAt)}
        </div>
      </div>
    </div>
  );

  // Handle loading more conversations
  const loadMoreDirect = () => {
    const nextPage = directPage + 1;
    setDirectPage(nextPage);
    fetchConversations(nextPage, false);
  };

  const loadMoreAnnouncements = () => {
    const nextPage = announcementPage + 1;
    setAnnouncementPage(nextPage);
    fetchConversations(nextPage, true);
  };

  // Render loading state
  if (loading && directConversations.length === 0 && announcements.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar_dashboard />
      <div className="flex h-screen flex-1 pl-16">
        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold mb-4">Inbox</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push("/pages/inbox/new")}
                className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#B9FF66] text-sm"
              >
                New Message
              </button>
              {isProf && (
                <button 
                  onClick={() => router.push("/pages/inbox/announcement")}
                  className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#B9FF66] text-sm"
                >
                  Announcement
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Announcements Column */}
            <div>
              <h2 className="text-md font-medium mb-3 flex items-center">
                Announcements
                {announcementUnreadCount > 0 && (
                  <span className="ml-2 bg-[#AAFF45] text-black text-xs rounded-full px-2 py-0.5">
                    {announcementUnreadCount}
                  </span>
                )}
              </h2>
              <div className="space-y-2">
                {announcements.length === 0 ? (
                  <div className="p-4 bg-gray-50 text-gray-500 text-center rounded-md">
                    No announcements yet.
                  </div>
                ) : (
                  <>
                    {announcements.map(renderConversationItem)}
                    {loading && hasMoreAnnouncements && (
                      <div className="flex justify-center p-2">
                        <div className="w-6 h-6 border-4 border-t-[#AAFF45] border-[#d1e3bb] rounded-full animate-spin"></div>
                      </div>
                    )}
                    {!loading && hasMoreAnnouncements && (
                      <button
                        onClick={loadMoreAnnouncements}
                        className="w-full p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Load More
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Direct Messages Column */}
            <div>
              <h2 className="text-md font-medium mb-3 flex items-center">
                Messages
                {directUnreadCount > 0 && (
                  <span className="ml-2 bg-[#AAFF45] text-black text-xs rounded-full px-2 py-0.5">
                    {directUnreadCount}
                  </span>
                )}
              </h2>
              <div className="space-y-2">
                {directConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-500 text-center rounded-md">
                    <p className="mb-2">No conversations yet</p>
                    <button 
                      onClick={() => router.push("/pages/inbox/new")}
                      className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#B9FF66] text-sm"
                    >
                      Start a new conversation
                    </button>
                  </div>
                ) : (
                  <>
                    {directConversations.map(renderConversationItem)}
                    {loading && hasMoreDirect && (
                      <div className="flex justify-center p-2">
                        <div className="w-6 h-6 border-4 border-t-[#AAFF45] border-[#d1e3bb] rounded-full animate-spin"></div>
                      </div>
                    )}
                    {!loading && hasMoreDirect && (
                      <button
                        onClick={loadMoreDirect}
                        className="w-full p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        Load More
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
