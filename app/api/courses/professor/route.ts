// This API route fetches the courses taught by a professor based on their Clerk userId.
// It checks if the user is authenticated and has the role of a professor before returning the courses.
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server"; 
import {prisma} from "@/lib/prisma"; 

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find professor by Clerk userId
  const professor = await prisma.user.findUnique({
    where: { id: userId },
    include: { teachingCourses: true }, // Fetch courses they teach
  });

  if (!professor || professor.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Not a professor" }, { status: 403 });
  }

  return NextResponse.json(professor.teachingCourses);
}
