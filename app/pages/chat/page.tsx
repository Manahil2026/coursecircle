"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from "@clerk/nextjs";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  moduleId: string;
  moduleName: string;
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

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { user } = useUser();
  const [fetchingModules, setFetchingModules] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistory = useRef<{ role: string; parts: { text: string }[] }[]>([]);
  
  // Flashcard states
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          user?.publicMetadata?.role === "prof"
            ? "/api/courses/professor"
            : "/api/courses/student"
        );
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    if (user) fetchCourses();
  }, [user]);

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

  const handleCourseSelection = async (id: string) => {
    const data = await fetchModules(id);
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
- If a user asks about flashcards or to generate flashcards, recommend using the flashcard generation button.

You can also help generate study flashcards based on the module content. The flashcards should focus on key concepts, definitions, and important points from the modules.

Always assume the user may be confused or unsure.
          `,
          },
        ],
      });
    } else {
      alert("No modules found for this course. Please try another course.");
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

  const generateFlashcards = async () => {
    if (!modules.length) return;
    
    setGeneratingFlashcards(true);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      if (!apiKey) {
        console.error("API key is not defined");
        setGeneratingFlashcards(false);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Create a detailed flashcard generation prompt with all module content
      let flashcardPrompt = `Generate 10 study flashcards based on the following course modules. Each flashcard should have a clear question and answer format and cover important concepts, definitions, or facts. Format the output as a JSON array with "question" and "answer" properties for each card.

Module details:\n`;

      modules.forEach(module => {
        flashcardPrompt += `\nMODULE: ${module.title}\n`;
        
        if (module.sections && module.sections.length > 0) {
          flashcardPrompt += "SECTIONS:\n";
          module.sections.forEach(section => {
            flashcardPrompt += `- ${section.title}: ${section.content}\n`;
          });
        }
      });
      
      flashcardPrompt += `\nGenerate 10 flashcards that cover the most important concepts from these modules. Return the flashcards in this format only:
[
  {
    "question": "Question 1?",
    "answer": "Answer 1"
  },
  {
    "question": "Question 2?",
    "answer": "Answer 2"
  }
]`;

      const result = await model.generateContent(flashcardPrompt);
      const response = result.response.text();
      
      try {
        // Extract JSON from the response (in case the AI includes explanatory text)
        const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : response;
        
        const flashcardsData = JSON.parse(jsonString);
        
        // Map the generated flashcards to our format
        const newFlashcards = flashcardsData.map((card: any, index: number) => ({
          id: Date.now() + index,
          question: card.question,
          answer: card.answer,
          moduleId: modules[0].id, // Associate with first module or distribute as needed
          moduleName: modules[0].title
        }));
        
        setFlashcards(newFlashcards);
        setShowFlashcards(true);
        setCurrentFlashcardIndex(0);
        setShowAnswer(false);
        
        // Add a notification message
        const notificationMessage: Message = {
          id: Date.now(),
          content: `✅ Generated ${newFlashcards.length} flashcards! You can now view them in the flashcard viewer.`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        
        setMessages((prev) => [...prev, notificationMessage]);
      } catch (parseError) {
        console.error("Error parsing flashcard data:", parseError);
        
        const errorMessage: Message = {
          id: Date.now(),
          content: "Sorry, I had trouble generating flashcards. Please try again.",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      
      const errorMessage: Message = {
        id: Date.now(),
        content: "Sorry, I encountered an error generating flashcards. Please try again.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const nextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const toggleFlashcardView = () => {
    setShowFlashcards(prev => !prev);
  };

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <div className="flex-1 min-h-screen text-black pl-16">
        <div className="h-screen flex flex-col">
          <div className="flex items-center p-3 pl-4 bg-gradient-to-r from-[#AAFF45] to-white justify-between">
            <div className="flex items-center">
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
            {courseId && (
              <div className="flex items-center">
                <button
                  onClick={generateFlashcards}
                  disabled={generatingFlashcards || !modules.length}
                  className={`mr-2 px-3 py-1 rounded-lg text-sm transition-colors flex items-center ${
                    generatingFlashcards || !modules.length
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {generatingFlashcards ? (
                    "Generating..."
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Generate Flashcards
                    </>
                  )}
                </button>
                {flashcards.length > 0 && (
                  <button
                    onClick={toggleFlashcardView}
                    className="px-3 py-1 rounded-lg text-sm bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {showFlashcards ? "Hide Flashcards" : "View Flashcards"}
                  </button>
                )}
              </div>
            )}
          </div>

          {!courseId ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-md bg-white border p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">
                  Select Your Course
                </h2>
                {courses.length === 0 ? (
                  <p className="text-gray-500">No courses available.</p>
                ) : (
                  <ul className="space-y-2">
                    {courses.map((course) => (
                      <li
                        key={course.id}
                        className="p-2 border rounded-md cursor-pointer hover:bg-gray-100"
                        onClick={() => handleCourseSelection(course.id)}
                      >
                        {course.code} - {course.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : showFlashcards && flashcards.length > 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl">
                <div className="bg-white border rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Flashcards</h2>
                    <div className="text-sm text-gray-600">
                      {currentFlashcardIndex + 1} / {flashcards.length}
                    </div>
                  </div>
                  
                  <div className="min-h-64 bg-white border rounded-lg p-6 mb-4 flex flex-col items-center justify-center text-center transition-all duration-300 relative"
                       style={{ perspective: "1000px" }}>
                    <div className={`absolute inset-0 p-6 flex items-center justify-center transform transition-all duration-500 ${showAnswer ? 'opacity-0 -rotate-y-90' : 'opacity-100 rotate-y-0'}`}>
                      <div className="text-xl font-medium">{flashcards[currentFlashcardIndex]?.question}</div>
                    </div>
                    <div className={`absolute inset-0 p-6 flex items-center justify-center transform transition-all duration-500 ${showAnswer ? 'opacity-100 rotate-y-0' : 'opacity-0 rotate-y-90'}`}>
                      <div className="text-lg">{flashcards[currentFlashcardIndex]?.answer}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={prevFlashcard}
                      disabled={currentFlashcardIndex === 0}
                      className={`px-4 py-2 rounded-lg ${
                        currentFlashcardIndex === 0
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={() => setShowAnswer(!showAnswer)}
                      className="px-4 py-2 rounded-lg bg-[#AAFF45] text-black hover:bg-[#8FE03D] transition-colors"
                    >
                      {showAnswer ? "Show Question" : "Show Answer"}
                    </button>
                    
                    <button
                      onClick={nextFlashcard}
                      disabled={currentFlashcardIndex === flashcards.length - 1}
                      className={`px-4 py-2 rounded-lg ${
                        currentFlashcardIndex === flashcards.length - 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
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