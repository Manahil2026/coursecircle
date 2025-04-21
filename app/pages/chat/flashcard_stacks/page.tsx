"use client";

import { useState, useEffect } from "react";
import FlashcardViewer from "@/app/components/chat_components/FlashcardViewer";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard"; // Import the sidebar

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  moduleId: string;
  moduleName: string;
  source: "module" | "custom";
  isSaved: boolean;
}

interface FlashcardStack {
  stackName: string;
  flashcards: Flashcard[];
}

export default function FlashcardsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId");
  const [flashcardStacks, setFlashcardStacks] = useState<FlashcardStack[]>([]);
  const [selectedStack, setSelectedStack] = useState<FlashcardStack | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [sortOption, setSortOption] = useState("alphabetical"); // State for sorting option

  useEffect(() => {
    const fetchFlashcardStacks = async () => {
      if (!courseId) return;
      const res = await fetch(`/api/flashcards/stacks?courseId=${courseId}`);
      const data: FlashcardStack[] = await res.json(); // Explicitly type the response
      console.log("API Response:", data); // Debugging
      setFlashcardStacks(data);
    };

    fetchFlashcardStacks();
  }, [courseId]);

  const handleBack = () => {
    router.push(`/pages/chat?courseId=${courseId}`); // Navigate back to the chatbot page
  };

  const openStack = (stack: FlashcardStack) => {
    setSelectedStack(stack);
  };

  const closeStack = () => {
    setSelectedStack(null);
  };

  const handleEditStack = async (oldStackName: string) => {
    const newStackName = prompt("Enter the new stack name:", oldStackName);
    if (!newStackName || newStackName.trim() === "") return;

    try {
      const res = await fetch(`/api/flashcards/stacks/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldStackName, newStackName, courseId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to update stack name.");
        return;
      }

      // Update the stack name in the UI
      setFlashcardStacks((prevStacks) =>
        prevStacks.map((stack) =>
          stack.stackName === oldStackName
            ? { ...stack, stackName: newStackName }
            : stack
        )
      );
      alert("Stack name updated successfully!");
    } catch (error) {
      console.error("Error updating stack name:", error);
      alert("An error occurred while updating the stack name.");
    }
  };

  const handleDeleteStack = async (stackName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the stack "${stackName}"? This will delete all associated flashcards.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/flashcards/stacks/name`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stackName, courseId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete stack.");
        return;
      }

      // Remove the stack from the UI
      setFlashcardStacks((prevStacks) =>
        prevStacks.filter((stack) => stack.stackName !== stackName)
      );
      alert("Stack deleted successfully!");
    } catch (error) {
      console.error("Error deleting stack:", error);
      alert("An error occurred while deleting the stack.");
    }
  };

  // Filter and sort stacks
  const filteredStacks = flashcardStacks
    .filter((stack) =>
      stack.stackName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "alphabetical") {
        return a.stackName.localeCompare(b.stackName);
      } else if (sortOption === "cardCount") {
        return b.flashcards.length - a.flashcards.length; // Sort by number of cards (descending)
      }
      return 0; // Default: no sorting
    });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-16  border-r">
        <Sidebar_dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-t from-[#AAFF45]/15 to-white p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Flashcard Stacks</h1>
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back to Chatbot
          </button>
        </div>
        {/* Search and Sort Controls */}
        <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search stacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full max-w-md"
          />

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="alphabetical">Sort Alphabetically</option>
            <option value="cardCount">Sort by Number of Cards</option>
          </select>
        </div>

        {/* Stacks Grid */}
        {flashcardStacks.length === 0 ? (
          <p className="text-center text-gray-600">No flashcards have been created yet.</p>
        ) : filteredStacks.length === 0 ? (
          <p className="text-center text-gray-600">No stacks match your search query.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStacks.map((stack) => (
              <div
                key={stack.stackName}
                className="border p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100"
                onClick={() => openStack(stack)}
              >
                <h2 className="text-lg font-semibold">{stack.stackName}</h2>
                <p className="text-sm text-gray-600">{stack.flashcards.length} flashcards</p>

                {/* Edit and Delete Buttons */}
                <div className="flex justify-between mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditStack(stack.stackName);
                    }}
                    className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStack(stack.stackName);
                    }}
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Flashcard Viewer Modal */}
        {selectedStack && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl relative">
              <button
                onClick={closeStack}
                className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <FlashcardViewer
                flashcards={selectedStack.flashcards}
                onClose={closeStack}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}