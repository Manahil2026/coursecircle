// This API route handles file uploads for course modules.
// It validates the file type, saves the file to the server, and stores its metadata in the database.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const moduleId = formData.get("moduleId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!moduleId) {
      return NextResponse.json({ error: "No module ID provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and Word documents are allowed." }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
      await writeFile(path.join(uploadDir, file.name), Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      console.error("Error saving file:", error);
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
    }

    // Save file metadata to database
    const savedFile = await prisma.moduleFile.create({
      data: {
        name: file.name,
        url: `/uploads/${file.name}`,
        type: file.type,
        moduleId,
      },
    });

    return NextResponse.json(savedFile, { status: 201 });
  } catch (error) {
    console.error("Error in file upload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
