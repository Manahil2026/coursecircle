import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string; assignmentId: string } }
) {
  try {
    const nextReq = new NextRequest(req);
    const { userId } = getAuth(nextReq);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, assignmentId } = await params;

    // First, verify the student is enrolled in the course
    const student = await prisma.user.findUnique({
      where: {
        id: userId,
        role: 'STUDENT',
        enrolledCourses: {
          some: { id: courseId }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Not enrolled in this course" }, 
        { status: 403 }
      );
    }

    // Find the assignment to get its details
    const assignment = await prisma.assignment.findUnique({
      where: { 
        id: assignmentId,
        courseId
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" }, 
        { status: 404 }
      );
    }

    // Find the student's submission for this assignment
    const submission = await prisma.submission.findUnique({
      where: {
        studentId_assignmentId: {
          studentId: userId,
          assignmentId
        }
      }
    });

    // Construct the response
    const gradeResponse = {
      assignmentId: assignment.id,
      assignmentName: assignment.title,
      totalPoints: assignment.points,
      pointsEarned: submission?.grade ?? null,
      submissionDate: submission?.createdAt.toISOString() ?? null,
      feedback: submission?.feedback ?? null,
      status: submission?.status ?? 'NOT_SUBMITTED',
      dueDate: assignment.dueDate?.toISOString() ?? null,
      isLate: submission && assignment.dueDate 
        ? submission.createdAt > assignment.dueDate 
        : false
    };

    return NextResponse.json(gradeResponse);
  } catch (error) {
    console.error("Error fetching assignment grade:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment grade" }, 
      { status: 500 }
    );
  }
}

