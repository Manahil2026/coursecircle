import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user is a participant in this conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: userId,
          conversationId: conversationId
        }
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Not a participant in this conversation" },
        { status: 403 }
      );
    }

    // Mark all messages from other users as read
    const updatedMessages = await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: userId },
        status: "SENT",
        isDraft: false
      },
      data: {
        status: "READ"
      }
    });

    return NextResponse.json({ success: true, count: updatedMessages.count });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
