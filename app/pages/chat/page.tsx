"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from "@clerk/nextjs";
import CourseSelector from "@/app/components/chat_components/CourseSelector";
import CustomTextInput from "@/app/components/chat_components/CustomTextInput";
import FlashcardViewer from "@/app/components/chat_components/FlashcardViewer";
import ChatMessageList from "@/app/components/chat_components/ChatMessageList";
import { generateAssistantPrompt } from "@/app/components/chat_components/assistantPrompt";
import { generateFlashcardPrompt } from "@/app/components/chat_components/flashcardPrompt";
import { fetchCourses, fetchModules, fetchAssignments } from "@/app/components/chat_components/apiUtils";
import ChatSessionList from "@/app/components/chat_components/ChatSessionList";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  moduleId: string;
  moduleName: string;
  source: "module" | "custom";
  stackName: string;
  isSaved: boolean;
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

interface Assignment {
  id: string;
  title: string;
  points: number;
  dueDate: string | null;
  published: boolean;
  groupName: string;
  courseId: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { user } = useUser();
  const [fetchingModules, setFetchingModules] = useState(false);
  const [fetchingAssignments, setFetchingAssignments] = useState(false);
  const chatHistory = useRef<{ role: string; parts: { text: string }[] }[]>([]);
  const [sessions, setSessions] = useState<{
    id: string;
    title?: string;
    createdAt: string;
  }[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  const getCourseName = () => {
    const selectedCourse = courses.find((course: Course) => course.id === courseId);
    return selectedCourse ? selectedCourse.name : "Unknown Course";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome! I'm your AI assistant. Please select a course to get started.",
      sender: "ai",
      timestamp: new Date().toISOString(),
    },
  ]);

  // Flashcard states
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [savingFlashcards, setSavingFlashcards] = useState(false);

  const [courseMembers, setCourseMembers] = useState<any[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      const coursesData = await fetchCourses(user?.publicMetadata?.role as string | undefined);
      if (coursesData) {
        setCourses(coursesData);
        // Update welcome message with the course name if a course is selected
        if (courseId) {
          const selectedCourse = coursesData.find((course: Course) => course.id === courseId);
          setMessages([
            {
              id: "1",
              content: `Welcome! I'm your AI assistant for ${selectedCourse?.name || "Unknown Course"}. I can help you with course-related questions.`,
              sender: "ai",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    };

    if (user) loadCourses();
  }, [user, courseId]);

  // After selecting a course, also load existing sessions and course members:
  useEffect(() => {
    if (courseId) {
      // Load sessions
      fetch(`/api/chat/sessions?courseId=${courseId}`)
        .then(res => res.json())
        .then(setSessions);

      // Load course members
      fetch(`/api/people?courseId=${courseId}`)
        .then(res => res.json())
        .then(setCourseMembers)
        .catch(error => console.error("Error fetching course members:", error));
    }
  }, [courseId]);

  const handleCourseSelection = async (id: string) => {
    setCourseId(id);
    setFetchingModules(true);
    setFetchingAssignments(true);

    try {
      // Fetch modules and assignments in parallel
      const [modulesData, assignmentsData] = await Promise.all([
        fetchModules(id, setModules, setCourseId, setFetchingModules),
        fetchAssignments(id, setAssignments, setFetchingAssignments)
      ]);

      setModules(modulesData || []);
      setAssignments(assignmentsData || []);

      // Create a new chat session regardless of modules/assignments
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      });
      const newSession = await res.json();
      setSessions(prev => [newSession, ...prev]);
      setCurrentChatId(newSession.id);

      // Initialize chatHistory with available data
      const moduleData = JSON.stringify(modulesData || [], null, 2);
      const assignmentData = JSON.stringify(assignmentsData || [], null, 2);
      const userRole = user?.publicMetadata?.role === "prof" ? "professor" : "student";
      const courseMembersData = JSON.stringify(courseMembers, null, 2);
      const initialPrompt = generateAssistantPrompt(moduleData, assignmentData, userRole, courseMembersData);
      chatHistory.current = [{
        role: "user",
        parts: [{ text: initialPrompt }],
      }];

      // Persist the initial message to the database
      await fetch(`/api/chat/${newSession.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: "",
          aiMessage: `Welcome! I'm your AI assistant for ${getCourseName()}. I can help you with course-related questions.`,
        }),
      });

    } catch (error) {
      console.error("Error initializing chat:", error);
      alert("Error initializing chat. Please try again.");
    } finally {
      setFetchingModules(false);
      setFetchingAssignments(false);
    }
  };

  async function createNewSession() {
    if (!courseId) return;
  
    // 1) create session
    const res = await fetch("/api/chat/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const newSession = await res.json();
  
    setSessions(prev => [newSession, ...prev]);
    setCurrentChatId(newSession.id);
  
    // 2) build initial context prompt
    const moduleData = JSON.stringify(modules, null, 2);
    const assignmentData = JSON.stringify(assignments, null, 2);
    const userRole = user?.publicMetadata?.role === "prof" ? "professor" : "student";
    const courseMembersData = JSON.stringify(courseMembers, null, 2);
    const initialPrompt = generateAssistantPrompt(moduleData, assignmentData, userRole, courseMembersData);
  
    // 3) seed chatHistory for Gemini
    chatHistory.current = [
      { role: "user", parts: [{ text: initialPrompt }] },
    ];
  
    // 4) welcome message
    const welcomeText = `Welcome! I'm your AI assistant for ${getCourseName()}. I can help you with course-related questions.`;
    
    // 5) seed UI
    setMessages([
      {
        id: crypto.randomUUID(),
        content: welcomeText,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  
    // 6) persist both to the DB
    await fetch(`/api/chat/${newSession.id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage: "",
        aiMessage: welcomeText,
      }),
    });
  }

  // Load a specific session's messages:
  async function loadSession(chatId: string) {
    setCurrentChatId(chatId);
    const res = await fetch(`/api/chat/${chatId}/messages`);
    const data = await res.json();

    // Map DB messages to UI state
    const msgs = data.map((m: any) => ({
      id: m.id,
      content: m.content,
      sender: m.sender,
      timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));
    setMessages(msgs);

    // Rebuild chatHistory for Gemini API and ensure it includes the initial context
    const userRole = user?.publicMetadata?.role === "prof" ? "professor" : "student";
    const courseMembersData = JSON.stringify(courseMembers, null, 2);
    chatHistory.current = [
      {
        role: "user",
        parts: [{ 
          text: generateAssistantPrompt(
            JSON.stringify(modules, null, 2),
            JSON.stringify(assignments, null, 2),
            userRole,
            courseMembersData
          )
        }],
      },
      ...data.map((m: any) => ({
        role: m.sender === "ai" ? "model" : "user",
        parts: [{ text: m.content }],
      }))
    ];
  }

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
    if (!inputMessage.trim() || isLoading || !currentChatId) return;

    const session = sessions.find(s => s.id === currentChatId);
    if (session && !session.title) {
      // First question: set title to the user's message (or truncated)
      const newTitle = inputMessage.length > 50 ? inputMessage.slice(0, 47) + '...' : inputMessage;
      await handleRenameSession(currentChatId!, newTitle);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
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

    // Persist both user & AI messages:
    await fetch(`/api/chat/${currentChatId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: currentMessage, aiMessage: aiResponseText }),
    });

    const aiResponseMessage: Message = {
      id: Date.now().toString(),
      content: aiResponseText,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, aiResponseMessage]);
  };

  // Rename handler
  async function handleRenameSession(id: string, title: string) {
    await fetch(`/api/chat/sessions/${id}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title }),
    });
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  }

  //  Delete handler
  async function handleDeleteSession(id: string) {
    if (!confirm('Delete this session?')) return;
    await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' });
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentChatId === id) {
      setCurrentChatId(null);
      setMessages([]);
    }
  }

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
        const newFlashcards = flashcardsData.map((card: any) => ({
          id: crypto.randomUUID(),
          question: card.question,
          answer: card.answer,
          moduleId: source === "modules" ? modules[0].id : null,
          moduleName: source === "modules" ? modules[0].title : null,
          source: source,
          isSaved: false,
        }));

        setFlashcards(newFlashcards);
        setShowFlashcards(true);

        if (source === "custom") {
          setShowCustomInput(false);
        }

        // Add a notification message
        const notificationMessage: Message = {
          id: crypto.randomUUID(),
          content: `✅ Generated ${newFlashcards.length} flashcards from ${source === "modules" ? "module content" : "your custom text"}!`,
          sender: "ai",
          timestamp: "", 
        };

        setMessages((prev) => [...prev, notificationMessage]);
      } catch (parseError) {
        console.error("Error parsing flashcard data:", parseError);

        const errorMessage: Message = {
          id: Date.now().toString(),
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
        id: Date.now().toString(),
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

  const saveFlashcardsToDB = async (flashcardsToSave: Flashcard[], stackName: string) => {
    if (!courseId || !user?.id) return;

    try {
      const res = await fetch(`/api/flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          stackName,
          flashcards: flashcardsToSave.map((card) => ({
            ...card,
            source: card.source || "custom",
            isSaved: true, // Set isSaved to true when saving to the database
          })),
          moduleId: flashcardsToSave[0]?.moduleId,
          moduleName: flashcardsToSave[0]?.moduleName,
          userId: user.id,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(`Failed to save flashcards: ${responseData.error || res.statusText}`);
      }

      console.log("Flashcards saved!", responseData);
    } catch (error) {
      console.error("Error saving flashcards:", error);
    }
  };

  const handleSaveFlashcards = async () => {
    if (!flashcards.length) return;

    const stackName = prompt("Enter a name for this flashcard stack:");
    if (!stackName) {
      alert("Flashcard stack name is required.");
      return;
    }

    setSavingFlashcards(true);

    try {
      await saveFlashcardsToDB(flashcards, stackName);
      alert("Flashcards saved!");
      router.push(`/pages/chat/flashcard_stacks?courseId=${courseId}`);
    } catch (err) {
      alert("Failed to save flashcards.");
    } finally {
      setSavingFlashcards(false);
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
      <div className="flex min-h-screen bg-gradient-to-t from-[#AAFF45]/15 to-white flex-1 pl-16 px-6">
        {courseId ? (
          <>
            <ChatSessionList
              sessions={sessions}
              onSelect={loadSession}
              onNew={createNewSession}
              onRename={handleRenameSession}
              onDelete={handleDeleteSession}
            />
            <div className="flex-1 min-h-screen text-black relative">
              <div className="h-screen flex flex-col">
                <div className="flex items-center p-3 pl-4 justify-between">
                  <div className="flex items-center">
                    <Image
                      src="/asset/ai_icon.svg"
                      alt="Chat icon"
                      width={35}
                      height={35}
                      className="text-black mr-2 filter brightness-0"
                    />
                  </div>
                  <div className="flex gap-2">
                    {courseId && (
                      <button
                        onClick={() => generateFlashcards("modules")}
                        disabled={generatingFlashcards || !modules.length}
                        className={`px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                          generatingFlashcards || !modules.length
                            ? "border-gray-100 border text-gray-400 cursor-not-allowed"
                            : "border-black border text-black hover:bg-[#abff4569]"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 4.804A6.999 6.999 0 0117 8a4.5 4.5 0 01-1.5 3.5L9 15.196V4.804zM6 8a6.999 6.999 0 018-3.196V15.196A6.999 6.999 0 016 8z" />
                        </svg>
                        {generatingFlashcards ? "Generating..." : "Module Flashcards"}
                      </button>
                    )}
                    {courseId && (
                      <button
                        onClick={toggleCustomInput}
                        className="px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 border-black border text-black hover:bg-[#abff4569]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                        {showCustomInput ? "Cancel" : "Custom Flashcards"}
                      </button>
                    )}
                    {flashcards.length > 0 && (
                      <button
                        onClick={toggleFlashcardView}
                        className="px-3 py-2 rounded text-sm flex items-center gap-2 border-black border text-black hover:bg-[#abff4569]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {showFlashcards ? "Hide" : "View Flashcards"}
                      </button>
                    )}
                    {courseId && (
                      <button
                        onClick={() => router.push(`/pages/chat/flashcard_stacks?courseId=${courseId}`)}
                        className="px-3 py-2 rounded text-sm flex items-center gap-2 border-black border text-black hover:bg-[#abff4569]"
                      >
                        <Image
                          src="/asset/layers.svg"
                          alt="Layers icon"
                          width={16}
                          height={16}
                          className="h-4 w-4"
                        />
                        View Stacks
                      </button>
                    )}
                  </div>
                </div>

                {showCustomInput ? (
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
                    onSave={handleSaveFlashcards}
                  />
                ) : (
                  <ChatMessageList
                    messages={messages}
                    inputMessage={inputMessage}
                    setInputMessage={setInputMessage}
                    handleSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    isFetchingModules={fetchingModules || fetchingAssignments}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-screen text-black">
            <div className="h-screen flex flex-col">
              <div className="flex items-center p-3 pl-4 justify-between">
                <div className="flex items-center">
                  <Image
                    src="/asset/ai_icon.svg"
                    alt="Chat icon"
                    width={30}
                    height={30}
                    className="text-black mr-2 filter brightness-0"
                  />
                </div>
              </div>
              <CourseSelector
                courses={courses}
                onSelectCourse={handleCourseSelection}
                isLoading={fetchingModules || fetchingAssignments}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}