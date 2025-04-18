// This API route fetches file details from the database and handles both regular course files and module files. 
// It first attempts to find a regular course file by its ID. 
// If not found, it checks for a module file with the same ID. 
// If either is found, it returns the file details in JSON format. 
// If neither is found, it returns a 404 error. 
// In case of any server errors, it returns a 500 error.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { fileId: string };
}

export async function GET(request: Request, { params }: Params) {
  const { fileId } = params;

  try {
    // First try to find a regular course file
    let file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    // If not found, try to find a module file
    if (!file) {
      const moduleFile = await prisma.moduleFile.findUnique({
        where: { id: fileId },
      });

      if (moduleFile) {
        // Convert ModuleFile to the expected format
        file = {
          id: moduleFile.id,
          name: moduleFile.name,
          url: moduleFile.url,
          type: moduleFile.type,
          courseId: "", // We don't have this directly, but could join with Module to get it
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json(file);
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
