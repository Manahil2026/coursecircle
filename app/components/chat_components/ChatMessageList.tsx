import { useRef, useEffect } from "react";

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
        {isFetchingModules && (
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
  );
}