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
    // Await the params object before destructuring
    const { courseId, assignmentId } = await params;

    // Clone the request before using it for auth
    const authRequest = new Request(req.url, {
      method: req.method,
      headers: req.headers,
    });

    const { userId } = getAuth(req as NextRequest);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Check if the assignment exists and belongs to the course, and get allowedAttempts
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        courseId
      },
      select: {
        allowedAttempts: true,
        dueDate: true,
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check the number of existing submissions for this student on this assignment
    const existingSubmissionsCount = await prisma.submission.count({
      where: {
        assignmentId: assignmentId,
        studentId: userId,
      },
    });

    const allowedAttempts = assignment.allowedAttempts; 

    if (existingSubmissionsCount >= allowedAttempts) {
      return NextResponse.json({ error: `Maximum submissions allowed (${allowedAttempts.toString()}) reached.` }, { status: 400 });
    }

    // Now safely read the formData for the first time
    const formData = await req.formData();
    const text = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;

    if (!file && !text) {
      return NextResponse.json({ error: "No submission provided" }, { status: 400 });
    }

    let fileName: string | undefined;
    let fileUrl: string | undefined;

    if (file) {
      // 1. ensure uploadDir exists
      await fs.mkdir(uploadDir, { recursive: true });

      // 2. generate a unique file name
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = file.name.split(".").pop();
      const generatedName = `submission-${uniqueSuffix}.${ext}`;
      const destPath = path.join(uploadDir, generatedName);

      // 3. write it
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(destPath, buffer);

      // 4. set for Prisma
      fileName = file.name;
      fileUrl  = `/uploads/${generatedName}`;
    }

    // Determine submission status based on due date
    const now = new Date();
    const isLate = assignment.dueDate && now > new Date(assignment.dueDate);
    const submissionStatus = isLate ? "SUBMITTED_LATE" : "SUBMITTED";

    // Create the submission record
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: userId,
        status: "SUBMITTED",
        // only set these if they’re defined
        ...(fileName && { fileName }),
        ...(fileUrl  && { fileUrl  }),
        ...(text    && { text    }),
      },
    });

    return NextResponse.json({ success: true, submission }, { status: 201 });
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
    // Await the params object before destructuring
    const { courseId, assignmentId } = await params;
    
    // Clone the request before using it for auth
    const authRequest = new Request(req.url, {
      method: req.method,
      headers: req.headers,
    });
    
    const { userId } = getAuth(req as NextRequest);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

      const assignment = await prisma.assignment.findUnique({
        where: {
            id: assignmentId,
            courseId,
        },
        select: {
            dueDate: true, 
        },
      });

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
      return NextResponse.json({ submissions, dueDate: assignment?.dueDate });
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
    // Await the params object before destructuring
    const { courseId } = await params;
    
    // Clone the request before using it for auth
    const authRequest = new Request(req.url, {
      method: req.method,
      headers: req.headers,
    });
    
    const { userId } = getAuth(req as NextRequest);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clone the request again for reading the JSON body
    const reqClone = req.clone();
    const { submissionId, grade, feedback, status } = await reqClone.json();

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
