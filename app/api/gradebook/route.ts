import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const courseId = request.url.split("?courseId=")[1];

  if (!courseId) {
    return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
  }

  try {
    // 1) Load your groups (with their weights) and all assignments
    const groups = await prisma.assignmentGroup.findMany({
      where: { courseId },
      include: { assignments: true },
    });

    // 2) Flatten assignments for the client
    const assignments = groups.flatMap((g) => g.assignments);

    // 3) Load all students + their submissions for this course
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        enrolledCourses: { some: { id: courseId } },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        submissions: {
          where: { assignment: { courseId } },
          select: {
            grade: true,
            assignment: {
              select: {
                id: true,
                title: true,
                dueDate: true,
                groupId: true,
                points: true,
              },
            },
          },
        },
      },
    });

    // 4) Compute the gradebook
    const gradebook = students.map((student) => {
      let totalWeightedSum = 0; // ∑ (groupAverage × groupWeight)
      let totalWeight = 0;      // ∑ groupWeight (only for groups with ≥1 graded)
      let hasAnyGrade = false;

      for (const group of groups) {
        const w = group.weight ?? 0;
        // filter to only the assignments this student has a non-null grade for
        const graded = group.assignments.filter((a) => {
          const sub = student.submissions.find((s) => s.assignment.id === a.id);
          return sub?.grade != null;
        });

        if (graded.length > 0) {
          hasAnyGrade = true;
          // compute that group’s average (in %)
          const sumPct = graded.reduce((sum, a) => {
            const sub = student.submissions.find((s) => s.assignment.id === a.id)!;
            return sum + (sub.grade! / a.points) * 100;
          }, 0);
          const groupAvg = sumPct / graded.length;

          totalWeightedSum += groupAvg * w;
          totalWeight += w;
        }
      }

      const weightedGrade =
        !hasAnyGrade
          ? "N/A"
          : totalWeight > 0
            ? parseFloat((totalWeightedSum / totalWeight).toFixed(2)) // Round to 2 decimal places
            : 0;

      return {
        studentId: student.id,
        name: `${student.firstName} ${student.lastName}`,
        weightedGrade,
      };
    });

    return NextResponse.json({ gradebook, assignments, students: students });
  } catch (error) {
    console.error("Error in gradebook route:", error);
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