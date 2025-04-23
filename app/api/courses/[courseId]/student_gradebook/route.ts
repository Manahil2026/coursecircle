import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const nextReq = new NextRequest(req);
    const { userId } = getAuth(nextReq);
    
    const { courseId } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Check if the student is enrolled in the course
    const isEnrolled = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "STUDENT",
        enrolledCourses: {
          some: { id: courseId },
        },
      },
    });
    if (!isEnrolled) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }
    // Get all assignment groups for the course
    const groups = await prisma.assignmentGroup.findMany({
      where: { courseId },
      include: {
        assignments: {
          include: {
            submissions: {
              where: { studentId: userId },
            },
          },
        },
      },
    });
    let finalGrade = 0;
    let totalWeight = 0;
    const detailedBreakdown = [];
    for (const group of groups) {
      const groupAssignments = group.assignments;
      // Filter out ungraded assignments
      const gradedAssignments = groupAssignments.filter(
        (assignment) => assignment.submissions[0]?.grade != null
      );
      let groupTotalPoints = 0;
      let groupEarnedPoints = 0;
      for (const assignment of gradedAssignments) {
        groupTotalPoints += assignment.points;
        const submission = assignment.submissions[0];
        if (submission?.grade != null) {
          groupEarnedPoints += submission.grade;
        }
      }
      if (groupTotalPoints > 0) {
        const groupPercentage = (groupEarnedPoints / groupTotalPoints) * 100;
        const weightedContribution = (groupPercentage / 100) * group.weight;
        finalGrade += weightedContribution;
        totalWeight += group.weight;
        detailedBreakdown.push({
          groupName: group.name,
          weight: group.weight,
          totalPoints: groupTotalPoints,
          earnedPoints: groupEarnedPoints,
          groupGradePercentage: parseFloat(groupPercentage.toFixed(2)), // Rounded to 2 decimal places
          contributionToFinal: parseFloat((weightedContribution * 100).toFixed(2)), // Rounded to 2 decimal places
        });
      }
    }
    const normalizedGrade = totalWeight > 0 
      ? parseFloat(((finalGrade / totalWeight) * 100).toFixed(2)) 
      : null;
    return NextResponse.json({
      finalGrade: normalizedGrade,
      breakdown: detailedBreakdown,
    });
  } catch (error) {
    console.error("Error calculating weighted grade:", error);
    return NextResponse.json(
      { error: "Failed to calculate grade" },
      { status: 500 }
    );
  }
}
