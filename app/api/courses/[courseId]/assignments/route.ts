// This API route handles the creation, retrieval, update, and deletion of assignments for a specific course.
// This API route is called by the overall assignments page. 
// This API route handles the creation, retrieval, update, and deletion of assignments for a specific course.
// This API route is called by the overall assignments page. 
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

interface Params {
  params: { courseId: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  const { courseId } = await params;
  const { userId } = getAuth(req);

  try {
    // Get user role for role-based optimization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    const isStudent = user?.role === "STUDENT";

    if (isStudent) {
      // For students: Only published assignments with essential fields
      const groups = await prisma.assignmentGroup.findMany({
        where: { courseId },
        select: {
          id: true,
          name: true,
          assignments: {
            where: { published: true }, // Only published assignments
            select: {
              id: true,
              title: true,
              points: true,
              dueDate: true,
              published: true,
              // Exclude description and other fields not needed for listing
            }
          }
        }
      });
      return NextResponse.json(groups);
    } else {
      // For professors: Full data needed for management
      const groups = await prisma.assignmentGroup.findMany({
        where: { courseId },
        include: { assignments: true },
      });
      return NextResponse.json(groups);
    }
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
    try {
        const { courseId } = await params;
        const body = await req.text(); // Read the raw request body
        console.log("Raw request body:", body); // Debugging log

        if (!body) {
            return NextResponse.json({ error: "Empty request body" }, { status: 400 });
        }

        const { title, points, dueDate, dueTime, assignmentId, groupId } = JSON.parse(body);

        // Validate mandatory fields
        if (!title || !points) {
            return NextResponse.json({ error: "Missing required fields: title and points are mandatory" }, { status: 400 });
        }

        // Handle optional dueDate and dueTime
        const dueDateTime = dueDate && dueTime ? new Date(`${dueDate}T${dueTime}`) : null;

        if (assignmentId) {
            const updatedAssignment = await prisma.assignment.update({
                where: { id: assignmentId },
                data: {
                    title,
                    points: Number(points),
                    dueDate: dueDateTime, // Can be null
                    groupId,
                },
            });
            return NextResponse.json(updatedAssignment);
        }

        const newAssignment = await prisma.assignment.create({
            data: {
                title,
                points: Number(points),
                dueDate: dueDateTime, // Can be null
                courseId,
                groupId,
            },
        });

        return NextResponse.json(newAssignment);
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { assignmentId } = await req.json();

    await prisma.assignment.delete({ where: { id: assignmentId } });

    return NextResponse.json({ message: "Assignment deleted" });
} 
