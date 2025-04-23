import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count unread messages (conversations where the user is a participant and has unread messages)
    const unreadCount = await prisma.conversation.count({
      where: {
        participants: {
          some: { userId }
        },
        messages: {
          some: {
            senderId: { not: userId },
            status: "SENT",
            isDraft: false
          }
        }
      }
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
