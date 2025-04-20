// This API route is used to fetch flashcards for a specific course and also to create flashcards.
// It retrieves the courseId from the request query parameters and fetches the flashcards from the database using Prisma.
import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

  const flashcards = await prisma.flashcard.findMany({ where: { courseId } });
  return NextResponse.json(flashcards);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { flashcards, courseId, moduleId, moduleName, userId, stackName } = data;

  console.log("Request Payload:", { flashcards, courseId, moduleId, moduleName, userId, stackName });

  if (!flashcards || !courseId || !userId) {
    return NextResponse.json({ error: "Missing required data (flashcards, courseId, or userId)" }, { status: 400 });
  }

  try {
    console.log("Data being passed to Prisma:", flashcards.map((card: any) => ({
      question: card.question,
      answer: card.answer,
      courseId,
      moduleId,
      moduleName,
      userId,
      source: card.source || "custom",
      stackName,
    })));

    const created = await prisma.flashcard.createMany({
      data: flashcards.map((card: any) => ({
        question: card.question,
        answer: card.answer,
        courseId,
        moduleId,
        moduleName,
        userId,
        source: card.source || "custom",
        stackName,
      })),
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("Error saving flashcards:", error);
    return NextResponse.json({ error: "Error saving flashcards" }, { status: 500 });
  }
}

