import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req); // Get the logged-in user's ID
  const courseId = req.nextUrl.searchParams.get("courseId");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  try {
    // Group flashcards by stackName for the specific user and course
    const stacks = await prisma.flashcard.groupBy({
      by: ["stackName"],
      where: { courseId, userId }, // Filter by courseId and userId
      _count: { _all: true },
    });

    // Fetch flashcards for each stack
    const flashcardStacks = await Promise.all(
      stacks.map(async (stack) => {
        const flashcards = await prisma.flashcard.findMany({
          where: { stackName: stack.stackName, courseId, userId }, // Filter by userId
        });
        return { stackName: stack.stackName, flashcards };
      })
    );

    return NextResponse.json(flashcardStacks);
  } catch (error) {
    console.error("Error fetching flashcard stacks:", error);
    return NextResponse.json({ error: "Failed to fetch flashcard stacks" }, { status: 500 });
  }
}