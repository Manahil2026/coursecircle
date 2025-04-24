"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: "DRAFT" | "SENT" | "READ";
  isDraft: boolean;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isAdmin?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  courseId?: string;
  course?: {
    id: string;
    name: string;
    code: string;
  };
  participants: Participant[];
  messages: Message[];
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  
  const { user, isLoaded } = useUser();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = params?.conversationId as string;

  // Load conversation and messages
  useEffect(() => {
    if (!conversationId) return;

    const fetchConversation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/conversations/${conversationId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch conversation");
        }
        
        const data = await response.json();
        setConversation(data);
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setError("Failed to load conversation. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [conversationId]);

  // Load draft message if draftId is provided
  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId) return;
      
      try {
        const response = await fetch(`/api/messages/drafts/${draftId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch draft");
        }
        
        const draft = await response.json();
        setNewMessage(draft.content);
        setCurrentDraftId(draft.id);
      } catch (err) {
        console.error("Error fetching draft:", err);
        setError("Failed to load draft. It may have been deleted or you don't have permission to view it.");
      }
    };
    
    loadDraft();
  }, [draftId]);

  // Mark conversation messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!conversationId) return;
      
      try {
        await fetch(`/api/conversations/${conversationId}/mark-read`, {
          method: 'POST',
        });
        
        // This will help refresh the inbox counter if user goes back
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('messages-read'));
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };

    if (conversation) {
      markMessagesAsRead();
    }
  }, [conversationId, conversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear "Draft Saved" message after a few seconds
  useEffect(() => {
    if (draftSaved) {
      const timeout = setTimeout(() => {
        setDraftSaved(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [draftSaved]);

  const fetchMoreMessages = async () => {
    if (!nextCursor || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const response = await fetch(`/api/conversations/${conversationId}/messages?cursor=${nextCursor}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch more messages");
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, ...data.messages]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error("Error fetching more messages:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!newMessage.trim()) return;
    
    try {
      setSavingDraft(true);
      setError(null);
      
      if (currentDraftId) {
        // Update existing draft
        const response = await fetch(`/api/messages/drafts/${currentDraftId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newMessage.trim(),
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to update draft");
        }
      } else {
        // Create new draft
        const response = await fetch('/api/messages/drafts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newMessage.trim(),
            conversationId,
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save draft");
        }
        
        const draft = await response.json();
        setCurrentDraftId(draft.id);
      }
      
      setDraftSaved(true);
    } catch (err) {
      console.error("Error saving draft:", err);
      setError("Failed to save draft. Please try again.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversationId) return;
    
    try {
      setSending(true);
      
      // If we have a draft, send it
      if (currentDraftId) {
        const response = await fetch(`/api/messages/drafts/${currentDraftId}`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error("Failed to send draft");
        }
        
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage("");
        setCurrentDraftId(null);
        
        // Remove draftId from URL
        if (draftId) {
          router.replace(`/pages/inbox/${conversationId}`);
        }
      } else {
        // Send new message
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newMessage.trim(),
            isDraft: false,
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
        
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  if (!isLoaded) {
    return <div>Loading user...</div>;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
        <button 
          onClick={() => router.push("/pages/inbox")}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
        >
          Back to Inbox
        </button>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
        Conversation not found
        <button 
          onClick={() => router.push("/pages/inbox")}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
        >
          Back to Inbox
        </button>
      </div>
    );
  }

  return (
    <>
      <Sidebar_dashboard />
      <div className="flex h-screen flex-1 pl-16">
        <div className="flex flex-col w-full">
          {/* Conversation Header */}
          <div className="border-b p-4 flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/pages/inbox")}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <Image src="/asset/back_icon.svg" alt="Back" width={20} height={20} />
              </button>
              <div>
                <h1 className="text-lg font-medium">{conversation.name}</h1>
                {conversation.isGroup && (
                  <p className="text-sm text-gray-500">
                    {conversation.participants.length} participants
                  </p>
                )}
                {conversation.course && (
                  <p className="text-xs text-gray-500">
                    Course: {conversation.course.code} - {conversation.course.name}
                  </p>
                )}
              </div>
            </div>
            {currentDraftId && (
              <div className="text-gray-500 text-sm bg-gray-100 px-3 py-1 rounded-full">
                Draft Mode
              </div>
            )}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {nextCursor && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={fetchMoreMessages}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load earlier messages"}
                </button>
              </div>
            )}

            {groupMessagesByDate().map(group => (
              <div key={group.date} className="mb-6">
                <div className="text-center my-4">
                  <span className="px-2 py-1 bg-gray-200 text-xs rounded-full">
                    {formatDate(group.messages[0].createdAt)}
                  </span>
                </div>
                
                {group.messages.map((message) => {
                  const isCurrentUser = message.sender.id === user?.id;
                  
                  return (
                    <div 
                      key={message.id}
                      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[75%] rounded-lg p-3 ${
                          isCurrentUser 
                            ? 'bg-[#AAFF45] text-black' 
                            : 'bg-white text-black border border-gray-200'
                        }`}
                      >
                        {!isCurrentUser && (
                          <div className="font-medium text-sm mb-1">
                            {message.sender.firstName} {message.sender.lastName}
                          </div>
                        )}
                        <div dangerouslySetInnerHTML={{ __html: message.content }}></div>
                        <div className="text-xs text-gray-500 text-right mt-1">
                          {formatTimestamp(message.createdAt)}
                          {isCurrentUser && (
                            <span className="ml-2">
                              {message.status === "READ" ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4 bg-white">
            {draftSaved && (
              <div className="mb-2 p-2 bg-green-100 text-green-700 rounded-md shadow-sm text-center animate-pulse">
                Message saved to drafts!
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex flex-col">
              <div className="flex mb-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-l-md p-2 focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
                  disabled={sending || savingDraft}
                />
                <button
                  type="submit"
                  className="bg-[#AAFF45] text-black px-4 py-2 rounded-r-md hover:bg-[#B9FF66] disabled:opacity-50"
                  disabled={!newMessage.trim() || sending || savingDraft}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!newMessage.trim() || savingDraft || sending}
                  className={`px-3 py-1 text-sm bg-white text-black border border-[#AAFF45] rounded hover:bg-gray-100 ${
                    !newMessage.trim() || savingDraft || sending ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {savingDraft ? "Saving..." : currentDraftId ? "Update Draft" : "Save as Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
