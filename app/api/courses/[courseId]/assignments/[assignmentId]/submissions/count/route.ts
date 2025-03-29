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

    // Verify user role: Only professors or admins are allowed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== "PROFESSOR" && user.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Not authorized to view submissions for this course" },
        { status: 403 }
      );
    }

    // If the user is a professor, check that they are the professor for this course
    if (user.role === "PROFESSOR") {
      const course = await prisma.course.findUnique({
        where: { id: params.courseId },
        select: { professorId: true },
      });

      if (!course || course.professorId !== userId) {
        return NextResponse.json(
          { error: "Not authorized to view submissions for this course" },
          { status: 403 }
        );
      }
    }

    // Fetch all submissions for the given assignment
    const submissions = await prisma.submission.findMany({
      where: { assignmentId: params.assignmentId },
      select: { studentId: true },
    });

    // Count unique student submissions
    const uniqueStudentIds = new Set(submissions.map((s) => s.studentId));
    const submissionCount = uniqueStudentIds.size;

    return NextResponse.json({ submissionCount });
  } catch (error) {
    console.error("Error fetching submissions count:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions count" },
      { status: 500 }
    );
  }
}
