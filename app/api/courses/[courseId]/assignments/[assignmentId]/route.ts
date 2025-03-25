import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

interface Params {
  params: { courseId: string; assignmentId: string };
}

export async function GET(req: Request, { params }: { params: { courseId: string, assignmentId: string }}) {
  const { courseId, assignmentId } = params;

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
  
    if (!assignment) {
      console.log("Assignment not found");
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }
  
    return NextResponse.json(assignment);
  } catch (error: any) {
    console.error("Error fetching assignment:", error.message, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { courseId, assignmentId } = params;
  const body = await req.text();

  try {
    const data = JSON.parse(body);

    // Optionally, validate the data here (e.g., check for required fields)

    // Update the assignment.
    // You can now include additional fields like description if your prisma model supports it.
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data, // This will update any fields passed in the payload
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
