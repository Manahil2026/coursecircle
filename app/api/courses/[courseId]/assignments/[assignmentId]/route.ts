// This API route handles the fetching and updating of assignment details for the assignment details page.
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

interface Params {
  params: { courseId: string; assignmentId: string };
}

export async function GET(req: Request, { params }: { params: { courseId: string, assignmentId: string }}) {
  const { courseId,  assignmentId } = params;

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

    // Update the assignment.
    
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data, 
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
