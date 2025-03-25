import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

export async function GET(req: Request, { params }: { params: { courseId: string, assignmentId: string } }) {
  try {
    const { assignmentId } = params;

    // Fetch all files related to the assignment
    const files = await prisma.assignmentFile.findMany({
      where: { assignmentId },
    });

    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
