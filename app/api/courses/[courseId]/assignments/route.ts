// This API route handles the creation, retrieval, update, and deletion of assignments for a specific course.
// This API route is called by the overall assignments page. 
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

interface Params {
  params: { courseId: string };
}

export async function GET(req: NextRequest, { params }: Params) {
    const { courseId } = await params;

    const groups = await prisma.assignmentGroup.findMany({
        where: { courseId },
        include: { assignments: true },
    });

    return NextResponse.json(groups);
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
        
        if (!title || !points || !dueDate || !dueTime) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const dueDateTime = new Date(`${dueDate}T${dueTime}`);

        if (assignmentId) {
            const updatedAssignment = await prisma.assignment.update({
                where: { id: assignmentId },
                data: { title, points: Number(points), dueDate: dueDateTime, groupId },
            });
            return NextResponse.json(updatedAssignment);
        }

        const newAssignment = await prisma.assignment.create({
            data: { title, points: Number(points), dueDate: dueDateTime, courseId, groupId },
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
