// This API route appends messages to a specific chat session
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from '@clerk/nextjs/server'

export async function POST(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const { chatId } = params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userMessage, aiMessage } = await req.json();
  if (!userMessage || !aiMessage) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  // Verify chat ownership
  const chat = await prisma.chat.findUnique({ where: { id: chatId } });
  if (!chat || chat.userId !== userId) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  // Create both messages
  await prisma.chatMessage.createMany({
    data: [
      { chatId, content: userMessage, sender: "user" },
      { chatId, content: aiMessage, sender: "ai" },
    ],
  });

  return NextResponse.json({ success: true });
}