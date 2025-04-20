import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  try {
    const stacks = await prisma.flashcard.groupBy({
      by: ["stackName"],
      where: { courseId },
      _count: { _all: true },
    });

    const flashcardStacks = await Promise.all(
      stacks.map(async (stack) => {
        const flashcards = await prisma.flashcard.findMany({
          where: { stackName: stack.stackName, courseId },
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