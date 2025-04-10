export const generateFlashcardPrompt = (
  source: "modules" | "custom",
  modules: any[],
  customText: string
): string => {
  let flashcardPrompt = "";

  if (source === "modules") {
    flashcardPrompt = `Generate 10 study flashcards based on the following course modules. Each flashcard should have a clear question and answer format and cover important concepts, definitions, or facts. Format the output as a JSON array with "question" and "answer" properties for each card.

Module details:\n`;

    modules.forEach((module) => {
      flashcardPrompt += `\nMODULE: ${module.title}\n`;

      if (module.sections && module.sections.length > 0) {
        flashcardPrompt += "SECTIONS:\n";
        module.sections.forEach((section: { title: string; content: string }) => {
          flashcardPrompt += `- ${section.title}: ${section.content}\n`;
        });
      }
    });
  } else {
    flashcardPrompt = `Generate 10 study flashcards based on the following text. Each flashcard should have a clear question and answer format and cover important concepts, definitions, or facts from the text. Format the output as a JSON array with "question" and "answer" properties for each card.

Study Text:
${customText}
`;
  }

  flashcardPrompt += `\nGenerate 10 flashcards that cover the most important concepts. Return the flashcards in this format only:
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

  return flashcardPrompt;
};
