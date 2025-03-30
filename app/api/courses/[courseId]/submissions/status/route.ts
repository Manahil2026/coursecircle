// This route gets all published assignemnts for a selected course and displays their submission status

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const nextReq = new NextRequest(req);
    const { userId } = getAuth(nextReq);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = params;

    // Check if user is enrolled in the course as a student
    const student = await prisma.user.findUnique({
      where: {
        id: userId,
        role: "STUDENT",
        enrolledCourses: {
          some: { id: courseId }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // Get all published assignments for the course
    const assignments = await prisma.assignment.findMany({
      where: { 
        courseId,
        published: true
      },
      select: { id: true }
    });

    // Get all submissions by this student for these assignments
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: userId,
        assignment: {
          courseId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['assignmentId'],
      select: {
        assignmentId: true,
        status: true
      }
    });

    // Create a map of assignment ID to submission status
    const statusMap: Record<string, string> = {};
    
    // Initialize all assignments as not submitted
    assignments.forEach(assignment => {
      statusMap[assignment.id] = "NOT_SUBMITTED";
    });
    
    // Update with actual submission statuses
    submissions.forEach(submission => {
      statusMap[submission.assignmentId] = submission.status;
    });

    return NextResponse.json({ statuses: statusMap });
  } catch (error) {
    console.error("Error fetching submission statuses:", error);
    return NextResponse.json({ error: "Failed to fetch submission statuses" }, { status: 500 });
  }
}
