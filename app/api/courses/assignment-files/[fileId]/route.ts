// This file fetches the file details from the server and displays it using a FileViewer component.
// This file handles the API routes for fetching and deleting assignment files.
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

export async function DELETE(req: Request, { params }: { params: { fileId: string } }) {
  const { fileId } = params;

  try {
    // Delete the file record from the database
    await prisma.assignmentFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
