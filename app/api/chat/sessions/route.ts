//This API route lists & creates Chat Sessions
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    const sessions = await prisma.chat.findMany({
      where: { courseId, userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true },
    });
  
    return NextResponse.json(sessions);
}

  export async function POST(req: NextRequest) {
    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    const chat = await prisma.chat.create({
      data: { courseId, userId },
      select: { id: true, title: true, createdAt: true },
    });
  
    return NextResponse.json(chat);
  }