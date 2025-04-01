import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const courseId = request.url.split("?courseId=")[1]; // Extract courseId from query params

  if (!courseId) {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }

  try {
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        dueDate: true,
        points: true,
      },
    });

    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        enrolledCourses: {
          some: { id: courseId },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        submissions: {
          where: {
            assignment: {
              courseId,
            },
          },
          select: {
            grade: true,
            assignment: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ assignments, students });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch gradebook data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { studentId, assignmentId, newGrade, graded } = await request.json();

    if (!studentId || !assignmentId || graded === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the submission in the database
    await prisma.submission.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
      },
      update: {
        grade: graded ? newGrade : null, // Set grade to null if ungraded
      },
      create: {
        studentId,
        assignmentId,
        grade: graded ? newGrade : null, // Set grade to null if ungraded
        fileName: "", // default value
        fileUrl: "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update grade:", error);
    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    );
  }
}