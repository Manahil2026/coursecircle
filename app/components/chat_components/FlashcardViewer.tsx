import { useState } from "react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  moduleId: string;
  moduleName: string;
  source: "module" | "custom";
  isSaved: boolean;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onClose: () => void;
  onSave?: (flashcards: Flashcard[]) => void;
}

export default function FlashcardViewer({ flashcards, onClose, onSave }: FlashcardViewerProps) {
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [shuffledFlashcards, setShuffledFlashcards] = useState<Flashcard[]>(flashcards);

  const currentFlashcard = shuffledFlashcards[currentFlashcardIndex];

  const shuffleFlashcards = () => {
    const newShuffled = [...shuffledFlashcards];
    for (let i = newShuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newShuffled[i], newShuffled[j]] = [newShuffled[j], newShuffled[i]];
    }
    setShuffledFlashcards(newShuffled);
    setCurrentFlashcardIndex(0);
    setShowAnswer(false);
  };

  const nextFlashcard = () => {
    if (currentFlashcardIndex < shuffledFlashcards.length - 1) {
      setCurrentFlashcardIndex((prev) => prev + 1);
      setShowAnswer(false);
      setIsEditing(false);
    }
  };

  const prevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex((prev) => prev - 1);
      setShowAnswer(false);
      setIsEditing(false);
    }
  };

  const updateFlashcard = async (id: string, updatedFields: { question: string; answer: string }, isSaved: boolean) => {
    if (!isSaved) {
      // If the flashcard is not saved, update it locally
      shuffledFlashcards[currentFlashcardIndex] = { ...currentFlashcard, ...updatedFields }; // Update locally
      setIsEditing(false);
      return;
    }

    // If the flashcard is saved, update it in the database
    try {
      const res = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error updating flashcard:", errorData.error);
        alert(errorData.error || "Failed to update flashcard.");
        return;
      }

      shuffledFlashcards[currentFlashcardIndex] = { ...currentFlashcard, ...updatedFields }; // Update locally
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating flashcard:", error);
      alert("An error occurred while updating the flashcard.");
    }
  };

  const deleteFlashcard = async (id: string, isSaved: boolean) => {
    // Confirmation alert
    const confirmDelete = window.confirm("Are you sure you want to delete this flashcard?");
    if (!confirmDelete) return;

    if (!isSaved) {
      // If the flashcard is not saved, delete it locally
      const newFlashcards = shuffledFlashcards.filter(card => card.id !== id);
      setShuffledFlashcards(newFlashcards);
      if (currentFlashcardIndex >= newFlashcards.length) {
        setCurrentFlashcardIndex((prev) => Math.max(prev - 1, 0));
      }
      return;
    }

    // If the flashcard is saved, delete it from the database
    try {
      const res = await fetch(`/api/flashcards/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error deleting flashcard:", errorData.error);
        alert(errorData.error || "Failed to delete flashcard.");
        return;
      }

      const newFlashcards = shuffledFlashcards.filter(card => card.id !== id);
      setShuffledFlashcards(newFlashcards);
      if (currentFlashcardIndex >= newFlashcards.length) {
        setCurrentFlashcardIndex((prev) => Math.max(prev - 1, 0));
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      alert("An error occurred while deleting the flashcard.");
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(shuffledFlashcards);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-white border rounded-lg shadow-lg relative">
          <div className="flex justify-end items-center p-1">
            {!isEditing && (
              <div className="flex items-center gap-0">
                <button
                  onClick={shuffleFlashcards}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Shuffle flashcards"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditQuestion(currentFlashcard.question);
                    setEditAnswer(currentFlashcard.answer);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <img src="/asset/edit_icon.svg" alt="Edit" className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteFlashcard(currentFlashcard.id, currentFlashcard.isSaved)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <img src="/asset/delete_icon.svg" alt="Delete" className="w-5 h-5" />
                </button>
                {onSave && (
                  <button
                    onClick={handleSave}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="min-h-64 bg-gradient-to-r from-[#AAFF45] via-[#57C785] to-[#EDDD53] p-6 flex flex-col items-center justify-center text-center">
            {isEditing ? (
              <>
                <input
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="w-full border px-2 py-1 mb-2"
                  placeholder="Edit question"
                />
                <textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="w-full border px-2 py-1"
                  placeholder="Edit answer"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateFlashcard(currentFlashcard.id, { question: editQuestion, answer: editAnswer }, currentFlashcard.isSaved)
                    }
                    className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg bg-gray-300 text-black hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div 
                onClick={() => setShowAnswer(!showAnswer)}
                className="cursor-pointer w-full"
              >
                <div className="text-xl font-medium">
                  {showAnswer ? currentFlashcard.answer : currentFlashcard.question}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1">
            <button
              onClick={prevFlashcard}
              disabled={currentFlashcardIndex === 0}
              className={`p-2 active:scale-90 transition-transform ${
                currentFlashcardIndex === 0
                  ? "text-gray-400 cursor-not-allowed opacity-50"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              aria-label="Previous"
            >
              <img src="/asset/arrowup_icon.svg" alt="Previous" className="w-8 h-8 rotate-[-90deg]" />
            </button>

            <div className="text-base text-gray-600 mx-1">
              {currentFlashcardIndex + 1} / {shuffledFlashcards.length}
            </div>

            <button
              onClick={nextFlashcard}
              disabled={currentFlashcardIndex === shuffledFlashcards.length - 1}
              className={`p-2 active:scale-90 transition-transform ${
                currentFlashcardIndex === shuffledFlashcards.length - 1
                  ? "text-gray-400 cursor-not-allowed opacity-50"
                  : "text-gray-700 hover:text-gray-900"
              }`}
              aria-label="Next"
            >
              <img src="/asset/arrowdown_icon.svg" alt="Next" className="w-8 h-8 rotate-[-90deg]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}