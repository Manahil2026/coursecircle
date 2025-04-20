// This page shows saved flashcards, allows edit/delete functionality, and fetches flashcards from the database.
"use client";
import { useEffect, useState } from "react";

export default function FlashcardList({ courseId }: { courseId: string }) {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState<number | null>(null);
    const [editQuestion, setEditQuestion] = useState("");
    const [editAnswer, setEditAnswer] = useState("");


    const fetchFlashcards = async () => {
        setLoading(true);
        const res = await fetch(`/api/flashcards?courseId=${courseId}`);
        const data = await res.json();
        console.log("Fetched flashcards:", data); // Debugging
        setFlashcards(data);
        setLoading(false);
    };

    const updateFlashcard = async (id: number, updatedFields: { question: string; answer: string }) => {
        await fetch(`/api/flashcards/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedFields),
        });
    };


    const deleteFlashcard = async (id: number) => {
        await fetch(`/api/flashcards/${id}`, { method: "DELETE" });
        fetchFlashcards(); // re-fetch after deletion
    };

    useEffect(() => {
        fetchFlashcards();
    }, [courseId]);

    if (loading) return <p>Loading flashcards...</p>;

    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Saved Flashcards</h3>
            <ul className="space-y-2">
                {flashcards.map((card: any) => (
                    <li key={card.id} className="border p-3 rounded bg-white shadow-sm">
                        {editId === card.id ? (
                            <>
                                <input
                                    value={editQuestion}
                                    onChange={(e) => setEditQuestion(e.target.value)}
                                    className="w-full border px-2 py-1 mb-1"
                                />
                                <textarea
                                    value={editAnswer}
                                    onChange={(e) => setEditAnswer(e.target.value)}
                                    className="w-full border px-2 py-1 mb-1"
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        className="text-green-600 hover:underline text-sm"
                                        onClick={async () => {
                                            await updateFlashcard(card.id, { question: editQuestion, answer: editAnswer });
                                            setEditId(null);
                                            fetchFlashcards();
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="text-gray-500 hover:underline text-sm"
                                        onClick={() => setEditId(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="font-medium">{card.question}</p>
                                <p className="text-sm text-gray-600">{card.answer}</p>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        className="text-blue-500 hover:underline text-sm"
                                        onClick={() => {
                                            setEditId(card.id);
                                            setEditQuestion(card.question);
                                            setEditAnswer(card.answer);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-500 hover:underline text-sm"
                                        onClick={() => deleteFlashcard(card.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}

            </ul>
        </div>
    );
}
