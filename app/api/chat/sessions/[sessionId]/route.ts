// This API route deletes and renames chat sessions
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from '@clerk/nextjs/server';

interface Params {
  sessionId: string;
}

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  const { title } = await req.json();
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

  // Verify ownership
  const existing = await prisma.chat.findUnique({ where: { id: sessionId } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  const updated = await prisma.chat.update({
    where: { id: sessionId },
    data: { title },
    select: { id: true, title: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { sessionId } = params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const existing = await prisma.chat.findUnique({ where: { id: sessionId } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  await prisma.chat.delete({ where: { id: sessionId } });
  return NextResponse.json({ success: true });
}