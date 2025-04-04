"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

interface Module {
  id: string;
  title: string;
  courseId: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  sections: {
    id: string;
    title: string;
    content: string;
    moduleId: string;
  }[];
  files: {
    id: string;
    name: string;
    url: string;
    type: string;
    moduleId: string;
  }[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseInput, setCourseInput] = useState("");
  const [fetchingModules, setFetchingModules] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistory = useRef<{ role: string; parts: { text: string }[] }[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchModules = async (id: string) => {
    setFetchingModules(true);
    try {
      const response = await fetch(`/api/modules?courseId=${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching modules: ${response.statusText}`);
      }
      const data = await response.json();
      setModules(data);
      setCourseId(id);
      return data;
    } catch (error) {
      console.error("Error fetching modules:", error);
      return null;
    } finally {
      setFetchingModules(false);
    }
  };

  const handleCourseIdSubmit = async () => {
    const trimmed = courseInput.trim();
    if (!trimmed) return;

    const data = await fetchModules(trimmed);
    if (data && data.length > 0) {
      const moduleData = JSON.stringify(data, null, 2);


      // ============================
      // === Prompt engineering for the AI ===
      // ============================
   
      chatHistory.current.push({
        role: "user",
        parts: [
          {
            text: `
You are an AI assistant helping a student navigate their course modules.

Module Data:
${moduleData}

Instructions:
- When ever asked about modules, provide the number, names, sections and files and not just the number of modules.
- Show module count and names if user asks about modules.
- Show sections and files with clear bullets.
- Help summarize or explain any part on request.
- End with helpful prompts.

Always assume the user may be confused or unsure.
          `,
          },
        ],
      });
    } else {
      alert("No modules found for this course ID. Please check the ID.");
    }
  };

  const generateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      if (!apiKey) {
        console.error("API key is not defined");
        return "Google API key is missing.";
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      chatHistory.current.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      const chat = model.startChat({
        history: chatHistory.current,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const aiResponse = result.response.text();

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
        <div className="h-screen flex flex-col">
          <div className="flex items-center p-3 pl-4 bg-gradient-to-r from-[#AAFF45] to-white">
            <Image
              src="/asset/chat.svg"
              alt="Chat icon"
              width={20}
              height={20}
              className="text-black mr-2"
            />
            <h1 className="text-lg font-bold">AI Assistant (Gemini)</h1>
            {courseId && (
              <span className="ml-4 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Course ID: {courseId}
              </span>
            )}
          </div>

          {!courseId ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-md bg-white border p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">
                  Enter Your Course ID
                </h2>
                <input
                  type="text"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  placeholder="e.g. CSIT-355"
                  className="w-full p-2 border border-black rounded-md mb-4"
                />
                <button
                  onClick={handleCourseIdSubmit}
                  className="w-full bg-[#AAFF45] text-black py-2 rounded-md hover:bg-[#90e13d]"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
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
                {fetchingModules && (
                  <div className="flex justify-center py-2">
                    <p className="text-sm text-gray-500">
                      Fetching module data...
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
