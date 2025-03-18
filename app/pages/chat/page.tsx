"use client";

import { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now(),
        content: "I'm an AI assistant. How can I help you today?",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <div className="flex-1 min-h-screen text-black pl-16">
        <div className="h-screen">
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center p-3 pl-4 bg-gradient-to-r from-[#AAFF45] to-white">
              <Image
                src="/asset/chat.svg"
                alt="Chat icon"
                width={20}
                height={20}
                className="text-black mr-2"
              />
              <h1 className="text-lg font-bold">AI Assistant</h1>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-[#AAFF45] text-black"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-base">Start a conversation with the AI assistant</p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AAFF45]"
                />
                <button
                  type="submit"
                  className="bg-[#AAFF45] text-black px-4 py-2 rounded-lg hover:bg-[#8FE03D] transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 