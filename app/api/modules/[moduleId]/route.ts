import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type FileItem = {
  id: string;
  name: string;
  url: string;
  type: string;
};

// GET - Fetch a single module
export async function GET(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const { moduleId } = params;

    if (!moduleId) {
      return NextResponse.json({ error: "Module ID is required" }, { status: 400 });
    }

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { sections: true, files: true },
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json({ error: "Failed to fetch module" }, { status: 500 });
  }
}

// PUT - Update an existing module
export async function PUT(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const { moduleId } = params;
    const data = await req.json();

    // First, update the module title and sections
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title: data.title,
        sections: {
          deleteMany: {}, // Delete all existing sections
          create: data.sections.map((section: { title: string; content: string }) => ({
            title: section.title,
            content: section.content,
          })),
        },
      },
      include: {
        sections: true,
        files: true,
      },
    });

    // If files are provided, update them
    if (data.files) {
      const files: FileItem[] = data.files;
      await prisma.moduleFile.updateMany({
        where: { moduleId },
        data: {
          name: files[0]?.name || "",
          url: files[0]?.url || "",
          type: files[0]?.type || "",
        },
      });
    }

    return NextResponse.json(updatedModule, { status: 200 });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
  }
}

// DELETE - Remove a module
export async function DELETE(req: Request, { params }: { params: { moduleId: string } }) {
  try {
    const { moduleId } = params;

    // Check if the module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { files: true, sections: true }, // Check if there are related files or sections
    });

    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // First, delete related files and sections (if not cascading)
    await prisma.moduleFile.deleteMany({
      where: { moduleId },
    });

    await prisma.moduleSection.deleteMany({
      where: { moduleId },
    });

    // Then, delete the module
    const deletedModule = await prisma.module.delete({
      where: { id: moduleId },
    });

    return NextResponse.json(deletedModule);
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json({ error: "Failed to delete module" }, { status: 500 });
  }
}


