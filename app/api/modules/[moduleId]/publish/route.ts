import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const { moduleId } = await params;

    // Validate moduleId
    if (!moduleId || typeof moduleId !== "string") {
      return NextResponse.json({ error: "Invalid module ID" }, { status: 400 });
    }

    const { published } = await req.json(); // Extract `published` value from the request body

    // Validate `published` value
    if (typeof published !== "boolean") {
      return NextResponse.json({ error: "Invalid publish status" }, { status: 400 });
    }

    // Check if the module exists
    const existingModule = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!existingModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // Update the module in the database
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: { published },
    });

    return NextResponse.json(updatedModule, { status: 200 });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}
