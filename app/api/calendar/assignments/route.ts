//This API route fetches assignments for the calendar based on their due date.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assignments = await prisma.assignment.findMany({
      where: {
        dueDate: {
          not: null, // Exclude assignments without a dueDate
        },
        published: true, // Exclude unpublished assignments
        OR: [
          {
            course: {
              students: {
                some: {
                  id: userId, // User is a student in the course
                },
              },
            },
          },
          {
            course: {
              professorId: userId, // User is the professor of the course
            },
          },
        ],
      },
      include: {
        course: {
          select: {
            name: true, // Include the course name
          },
        },
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}