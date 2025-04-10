"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from "@clerk/nextjs";
import CourseSelector from "@/app/components/chat_components/CourseSelector";
import CustomTextInput from "@/app/components/chat_components/CustomTextInput";
import FlashcardViewer from "@/app/components/chat_components/FlashcardViewer";
import ChatMessageList from "@/app/components/chat_components/ChatMessageList";
import { generateAssistantPrompt } from "@/app/components/chat_components/assistantPrompt"; // Import the utility function
import { generateFlashcardPrompt } from "@/app/components/chat_components/flashcardPrompt"; // Import the new utility function
import { fetchCourses, fetchModules } from "@/app/components/chat_components/apiUtils"; // Import the new utility functions

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
  const chatHistory = useRef<{ role: string; parts: { text: string }[] }[]>([]);

  // Flashcard states
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      const coursesData = await fetchCourses(user?.publicMetadata?.role as string | undefined);
      if (coursesData) setCourses(coursesData);
    };

    if (user) loadCourses();
  }, [user]);

  const handleCourseSelection = async (id: string) => {
    const data = await fetchModules(id, setModules, setCourseId, setFetchingModules);
    if (data && data.length > 0) {
      const moduleData = JSON.stringify(data, null, 2);

      chatHistory.current.push({
        role: "user",
        parts: [
          {
            text: generateAssistantPrompt(moduleData), // Use the utility function
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

  const generateFlashcards = async (
    source: "modules" | "custom" = "modules"
  ) => {
    if (source === "modules" && !modules.length) return;
    if (source === "custom" && !customText.trim()) {
      alert("Please enter some text to generate flashcards from.");
      return;
    }

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

      const flashcardPrompt = generateFlashcardPrompt(source, modules, customText);

      const result = await model.generateContent(flashcardPrompt);
      const response = result.response.text();

      try {
        // Extract JSON from the response (in case the AI includes explanatory text)
        const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
        const jsonString = jsonMatch ? jsonMatch[0] : response;

        const flashcardsData = JSON.parse(jsonString);

        // Map the generated flashcards to our format
        const newFlashcards = flashcardsData.map(
          (card: any, index: number) => ({
            id: Date.now() + index,
            question: card.question,
            answer: card.answer,
            moduleId: source === "modules" ? modules[0].id : "custom",
            moduleName:
              source === "modules" ? modules[0].title : "Custom Content",
          })
        );

        setFlashcards(newFlashcards);
        setShowFlashcards(true);

        if (source === "custom") {
          setShowCustomInput(false);
        }

        // Add a notification message
        const notificationMessage: Message = {
          id: Date.now(),
          content: `✅ Generated ${newFlashcards.length} flashcards from ${
            source === "modules" ? "module content" : "your custom text"
          }! You can now view them in the flashcard viewer.`,
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
          content:
            "Sorry, I had trouble generating flashcards. Please try again.",
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
        content:
          "Sorry, I encountered an error generating flashcards. Please try again.",
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

  const handleCustomTextChange = (text: string) => {
    setCustomText(text);
  };

  const toggleFlashcardView = () => {
    setShowFlashcards((prev) => !prev);
  };

  const toggleCustomInput = () => {
    setShowCustomInput((prev) => !prev);
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
            <div className="flex items-center">
              {courseId && (
                <button
                  onClick={() => generateFlashcards("modules")}
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
                    <>Generate From Modules</>
                  )}
                </button>
              )}
              <button
                onClick={toggleCustomInput}
                className="mr-2 px-3 py-1 rounded-lg text-sm transition-colors flex items-center bg-purple-500 text-white hover:bg-purple-600"
              >
                {showCustomInput ? "Cancel Custom Input" : "Custom Flashcards"}
              </button>
              {flashcards.length > 0 && (
                <button
                  onClick={toggleFlashcardView}
                  className="px-3 py-1 rounded-lg text-sm bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center"
                >
                  {showFlashcards ? "Hide Flashcards" : "View Flashcards"}
                </button>
              )}
            </div>
          </div>

          {!courseId && !showCustomInput ? (
            <CourseSelector
              courses={courses}
              onSelectCourse={handleCourseSelection}
              isLoading={fetchingModules}
            />
          ) : showCustomInput ? (
            <CustomTextInput
              customText={customText}
              onTextChange={handleCustomTextChange}
              onGenerate={() => generateFlashcards("custom")}
              onCancel={toggleCustomInput}
              isGenerating={generatingFlashcards}
            />
          ) : showFlashcards && flashcards.length > 0 ? (
            <FlashcardViewer
              flashcards={flashcards}
              onClose={toggleFlashcardView}
            />
          ) : (
            <ChatMessageList
              messages={messages}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSendMessage}
              isLoading={isLoading}
              isFetchingModules={fetchingModules}
            />
          )}
        </div>
      </div>
    </div>
  );
}
