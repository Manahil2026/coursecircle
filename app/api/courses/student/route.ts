// This API route fetches the courses a student is enrolled in.
// It uses the Clerk authentication to get the userId and fetches the courses from the database.
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server"; 
import { prisma } from "@/lib/prisma"; 

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  console.log("User ID from Clerk:", userId);
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
