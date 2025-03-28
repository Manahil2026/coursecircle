// This API route is used to update the published status of an assignment.
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { courseId: string; assignmentId: string } }) {
  const { assignmentId } = params;

  try {
    const body = await req.json();
    const { published } = body;

    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { published },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error publishing assignment:", error);
    return NextResponse.json({ error: "Failed to publish assignment" }, { status: 500 });
  }
}
