import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const moduleId = formData.get("moduleId") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public/uploads", file.name);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  const savedFile = await prisma.moduleFile.create({
    data: {
      name: file.name,
      url: `/uploads/${file.name}`,
      type: file.type,
      moduleId,
    },
  });

  return NextResponse.json(savedFile, { status: 201 });
}
