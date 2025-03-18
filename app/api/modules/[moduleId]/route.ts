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

    // Ensure data.files is correctly typed
    const files: FileItem[] = data.files || []; // Ensure it's an array of file items

    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        files: {
          updateMany: files.map((fileItem: FileItem) => ({
            where: { id: fileItem.id }, // Assuming you have file ID here from previous upload
            data: {
              name: fileItem.name,
              url: fileItem.url,
              type: fileItem.type,
            },
          })),
        },
      },
    });

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

