import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

interface ChatMessageListProps {
  messages: Message[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
  isFetchingModules: boolean;
}

export default function ChatMessageList({
  messages,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isLoading,
  isFetchingModules
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-h-[calc(100vh-8rem)]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user"
                ? "justify-end pr-4"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-2 ${
                message.sender === "user"
                  ? "bg-[#AAFF45] text-black"
                  : "bg-gray-100 text-black"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none prose-p:my-1 prose-headings:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
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
        {isFetchingModules && (
          <div className="flex justify-center py-1">
            <p className="text-sm text-gray-500">
              Fetching module data...
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-2">
        <form onSubmit={handleSendMessage} className="flex gap-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#AAFF45]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className={`px-3 py-1.5 rounded-lg ${
              isLoading || !inputMessage.trim()
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#AAFF45] text-black hover:bg-[#8FE03D]"
            }`}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </>
  );
}