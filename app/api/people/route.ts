import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json({ error: "Invalid or missing courseId" }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        students: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        professor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const formattedUsers = [
      ...course.students.map(student => ({
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        role: student.role,
      })),
      ...(course.professor
        ? [
            {
              name: `${course.professor.firstName} ${course.professor.lastName}`,
              email: course.professor.email,
              role: course.professor.role,
            },
          ]
        : []),
    ];

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching people for course:", error);
    return NextResponse.json({ error: "Failed to fetch people for course" }, { status: 500 });
  }
}