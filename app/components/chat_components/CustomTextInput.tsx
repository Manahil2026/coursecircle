interface CustomTextInputProps {
    customText: string;
    onTextChange: (text: string) => void;
    onGenerate: () => void;
    onCancel: () => void;
    isGenerating: boolean;
  }
  
  export default function CustomTextInput({
    customText,
    onTextChange,
    onGenerate,
    onCancel,
    isGenerating
  }: CustomTextInputProps) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white border p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Generate Flashcards from Custom Text
          </h2>
          <p className="text-gray-600 mb-4">
            Paste your notes, text, or any content you want to create flashcards from.
          </p>
          <textarea
            value={customText}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Paste your text here..."
            className="w-full h-64 p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#AAFF45]"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onGenerate}
              disabled={isGenerating || !customText.trim()}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isGenerating || !customText.trim()
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#AAFF45] text-black hover:bg-[#8FE03D]"
              }`}
            >
              {isGenerating ? "Generating..." : "Generate Flashcards"}
            </button>
          </div>
        </div>
      </div>
    );
  }