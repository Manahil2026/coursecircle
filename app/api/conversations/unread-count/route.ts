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

    // Count unread messages in regular conversations
    const directUnreadCount = await prisma.message.count({
      where: {
        status: "SENT",
        isDraft: false,
        senderId: { not: userId }, // Exclude user's own messages
        conversation: {
          participants: {
            some: { userId }
          },
          isAnnouncement: false // Only direct messages
        }
      }
    });

    // Count unread announcements
    const announcementUnreadCount = await prisma.message.count({
      where: {
        status: "SENT",
        isDraft: false,
        senderId: { not: userId }, // Exclude user's own messages
        conversation: {
          participants: {
            some: { userId }
          },
          isAnnouncement: true // Only announcements
        }
      }
    });

    // Total unread count for the badge
    const totalUnreadCount = directUnreadCount + announcementUnreadCount;

    return NextResponse.json({
      unreadCount: totalUnreadCount,
      directUnreadCount,
      announcementUnreadCount
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    );
  }
}
