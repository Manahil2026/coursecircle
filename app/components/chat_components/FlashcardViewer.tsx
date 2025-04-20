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

  const currentFlashcard = flashcards[currentFlashcardIndex];

  const nextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
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
      flashcards[currentFlashcardIndex] = { ...currentFlashcard, ...updatedFields }; // Update locally
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

      flashcards[currentFlashcardIndex] = { ...currentFlashcard, ...updatedFields }; // Update locally
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

    console.log("Deleting flashcard with ID:", id, "Saved:", isSaved); // Debugging

    if (!isSaved) {
      // If the flashcard is not saved, delete it locally
      flashcards.splice(currentFlashcardIndex, 1); // Remove locally
      if (currentFlashcardIndex >= flashcards.length) {
        setCurrentFlashcardIndex((prev) => Math.max(prev - 1, 0)); // Adjust index if necessary
      }
      alert("Flashcard deleted successfully!"); // Success alert
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

      flashcards.splice(currentFlashcardIndex, 1); // Remove locally
      if (currentFlashcardIndex >= flashcards.length) {
        setCurrentFlashcardIndex((prev) => Math.max(prev - 1, 0)); // Adjust index if necessary
      }
      alert("Flashcard deleted successfully!"); // Success alert
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      alert("An error occurred while deleting the flashcard.");
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(flashcards);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white border rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Flashcards</h2>
            <div className="text-sm text-gray-600">
              {currentFlashcardIndex + 1} / {flashcards.length}
            </div>
          </div>

          <div className="min-h-64 bg-white border rounded-lg p-6 mb-4 flex flex-col items-center justify-center text-center">
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
                <div className="flex gap-2 mt-4">
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
              <>
                <div className="text-xl font-medium">
                  {showAnswer ? currentFlashcard.answer : currentFlashcard.question}
                </div>
                <button
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#AAFF45] text-black hover:bg-[#8FE03D] transition-colors"
                >
                  {showAnswer ? "Show Question" : "Show Answer"}
                </button>
              </>
            )}
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

            {!isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditQuestion(currentFlashcard.question);
                    setEditAnswer(currentFlashcard.answer);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  Edit
                </button>
                {onSave && (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg bg-[#AAFF45] text-black hover:bg-[#8FE03D]"
                  >
                    Save Stack
                  </button>
                )}
                <button
                  onClick={() => deleteFlashcard(currentFlashcard.id, currentFlashcard.isSaved)}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            )}

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
  );
}