import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; 

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  try {
    const { fileId } = params;
    const file = await prisma.assignmentFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
