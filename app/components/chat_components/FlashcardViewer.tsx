import { useState } from "react";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  moduleId: string;
  moduleName: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export default function FlashcardViewer({ flashcards, onClose }: FlashcardViewerProps) {
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

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

  return (
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
  );
}