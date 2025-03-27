
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { courseId: string; assignmentId: string } }) {
  const { assignmentId } = params;
  const body = await req.json();

  try {
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { published: true },
    });
    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error publishing assignment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
