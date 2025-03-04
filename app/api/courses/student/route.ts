import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server"; // Assuming you use Clerk for authentication
import { prisma } from "@/lib/prisma"; // Ensure this is your Prisma client instance

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find student by Clerk userId
  const student = await prisma.user.findUnique({
    where: { id: userId },
    include: { enrolledCourses: true }, // Fetch courses they are enrolled in
  });

  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Not a student" }, { status: 403 });
  }

  return NextResponse.json(student.enrolledCourses);
}
