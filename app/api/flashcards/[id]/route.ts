// This API route is used to update and also delete a specific flashcard.
import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const data = await req.json();
    const updated = await prisma.flashcard.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  }

  export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    try {
      const deleted = await prisma.flashcard.delete({
        where: { id: params.id },
      });
      return NextResponse.json(deleted);
    } catch (error: any) {
      if (error.code === "P2025") {
        console.error("Flashcard not found:", params.id);
        return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
      }
      console.error("Error deleting flashcard:", error);
      return NextResponse.json({ error: "Error deleting flashcard" }, { status: 500 });
    }
  }
  
  