"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI client
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("API key is not defined");
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistory = useRef<{ role: string; parts: { text: string }[] }[]>([]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateAIResponse = async (userMessage: string) => {
    setIsLoading(true);

    try {
      // Update chat history with user message
      chatHistory.current.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      // Start a chat and get a response
      const chat = model.startChat({
        history: chatHistory.current,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const aiResponse = result.response.text();

      // Update chat history with AI response
      chatHistory.current.push({
        role: "model",
        parts: [{ text: aiResponse }],
      });

      return aiResponse;
    } catch (error) {
      console.error("Error generating AI response:", error);
      return "Sorry, I encountered an error. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");

    // Get AI response
    const aiResponseText = await generateAIResponse(currentMessage);

    const aiResponseMessage: Message = {
      id: Date.now(),
      content: aiResponseText,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, aiResponseMessage]);
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
              <h1 className="text-lg font-bold">AI Assistant (Gemini)</h1>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-[#AAFF45] text-black"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-base">
                    Start a conversation with the AI assistant
                  </p>
                </div>
              )}
              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
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
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isLoading
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-[#AAFF45] text-black hover:bg-[#8FE03D]"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
