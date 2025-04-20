// This API route is used to update the stack name or delete flashcard stacks by their names.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const { oldStackName, newStackName, courseId } = await req.json();

  if (!oldStackName || !newStackName || !courseId) {
    return NextResponse.json(
      { error: "Missing required data (oldStackName, newStackName, or courseId)" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.flashcard.updateMany({
      where: { stackName: oldStackName, courseId },
      data: { stackName: newStackName },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating stack name:", error);
    return NextResponse.json({ error: "Failed to update stack name" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { stackName, courseId } = await req.json();

  if (!stackName || !courseId) {
    return NextResponse.json(
      { error: "Missing required data (stackName or courseId)" },
      { status: 400 }
    );
  }

  try {
    const deleted = await prisma.flashcard.deleteMany({
      where: { stackName, courseId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Error deleting stack:", error);
    return NextResponse.json({ error: "Failed to delete stack" }, { status: 500 });
  }
}