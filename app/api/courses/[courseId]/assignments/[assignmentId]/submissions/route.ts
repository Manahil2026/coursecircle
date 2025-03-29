// This route has endpoints for POST (student assignment submissions), GET (retrieve submissions; prof sees everyone's), and PUT (updating of submissions with grades by prof).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest } from "next/server";

const uploadDir = path.join(process.cwd(), "public", "uploads");

// POST endpoint to create a new submission
export async function POST(
  req: Request,
  { params }: { params: { courseId: string; assignmentId: string } }
) {
  try {
    const nextReq = new NextRequest(req); // Wrap the Request object
    const { userId } = getAuth(nextReq);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, assignmentId } = params;
    
    // Check if the student is enrolled in the course
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

    // Check if the assignment exists and belongs to the course
    const assignment = await prisma.assignment.findUnique({
      where: { 
        id: assignmentId,
        courseId
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error("Error creating upload directory", err);
    }

    // Generate a unique file name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExt = file.name.split(".").pop();
    const fileName = `submission-${uniqueSuffix}.${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    // Write the file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Create the submission record
    const submission = await prisma.submission.create({
      data: {
        fileName: file.name,
        fileUrl,
        status: "SUBMITTED", // This maps to SubmissionStatus.SUBMITTED in the enum
        assignmentId,
        studentId: userId,
      }
    });

    return NextResponse.json({ 
      success: true, 
      submission
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}

// GET endpoint to retrieve submissions for an assignment
export async function GET(
  req: Request,
  { params }: { params: { courseId: string; assignmentId: string } }
) {
  try {
    const nextReq = new NextRequest(req); // Wrap the Request object
    const { userId } = getAuth(nextReq); // Use the wrapped NextRequest
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, assignmentId } = params;

    // First check if assignment exists and belongs to the course
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        courseId,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Get user's role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For students, only return their own submissions
    if (user.role === "STUDENT") {
      const isEnrolled = await prisma.course.findFirst({
        where: {
          id: courseId,
          students: {
            some: { id: userId },
          },
        },
      });

      if (!isEnrolled) {
        return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
      }

      const submissions = await prisma.submission.findMany({
        where: {
          assignmentId,
          studentId: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ submissions });
    }
    // For professors, return all submissions with student info
    else if (user.role === "PROFESSOR" || user.role === "ADMIN") {
      if (user.role === "PROFESSOR") {
        const course = await prisma.course.findUnique({
          where: {
            id: courseId,
            professorId: userId,
          },
        });

        if (!course) {
          return NextResponse.json(
            { error: "Not authorized to view this course's submissions" },
            { status: 403 }
          );
        }
      }

      const submissions = await prisma.submission.findMany({
        where: {
          assignmentId,
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ submissions });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

// PUT endpoint to update a submission (for grading)
export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; assignmentId: string } }
) {
  try {
    const nextReq = new NextRequest(req); // Wrap the Request object
    const { userId } = getAuth(nextReq); // Use the wrapped NextRequest
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId, grade, feedback, status } = await req.json();
    const { courseId } = params;

    // Check if user is a professor for this course or an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "PROFESSOR") {
      const course = await prisma.course.findUnique({
        where: {
          id: courseId,
          professorId: userId,
        },
      });

      if (!course) {
        return NextResponse.json(
          { error: "Not authorized to grade submissions for this course" },
          { status: 403 }
        );
      }
    } else if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only professors and admins can grade submissions" },
        { status: 403 }
      );
    }

    // Update the submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: grade !== undefined ? grade : undefined,
        feedback: feedback !== undefined ? feedback : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    return NextResponse.json({ submission: updatedSubmission });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
