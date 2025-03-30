// This route is used to upload files for assignments.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function POST(req: Request, { params }: { params: { courseId: string, assignmentId: string }}) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const assignmentId = formData.get("assignmentId") as string;

  if (!file || !assignmentId) {
    return NextResponse.json({ error: "Missing file or assignmentId" }, { status: 400 });
  }

  // Create uploads directory if it doesn't exist.
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error("Error creating upload directory", err);
  }

  // Generate a unique file name to avoid collisions.
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const fileExt = file.name.split(".").pop();
  const fileName = `${uniqueSuffix}.${fileExt}`;
  const filePath = path.join(uploadDir, fileName);

  // Read the file from the request and write it to the file system.
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Generate a URL that points to the file.
  // In Next.js, files in the "public" directory are served at the root URL.
  const fileUrl = `/uploads/${fileName}`;

  // Create a record in the database:
  const newFile = await prisma.assignmentFile.create({
    data: {
      fileName: file.name, // original name
      fileUrl,             // local URL for the file
      assignment: { connect: { id: assignmentId } },
    },
  });

  return NextResponse.json({ fileUrl: newFile.fileUrl, fileName: newFile.fileName });
}
