// app/api/conversations/[conversationId]/messages/route.ts
// route handler for getting(using pagination), sending, and saving drafts of messages within a specific cconversation
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

interface Params {
  params: { conversationId: string };
}

// GET messages from a conversation with pagination
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { conversationId } = await params;
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

    // Get pagination parameters
    const { searchParams } = new URL(req.url);
    const cursorId = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    
    // Build the query
    const whereClause: any = {
      conversationId: conversationId,
    };
    
    // Only include user's own drafts, not others'
    if (!includeDrafts) {
      whereClause.isDraft = false;
    } else {
      whereClause.OR = [
        { isDraft: false },
        { 
          isDraft: true,
          senderId: userId
        }
      ];
    }

    // Fetch messages with pagination
    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      ...(cursorId && {
        cursor: {
          id: cursorId
        },
        skip: 1 // Skip the cursor itself
      })
    });

    // Update status of unread messages to READ for this user
    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: {
            in: messages
              .filter(m => !m.isDraft && m.senderId !== userId && m.status === "SENT")
              .map(m => m.id)
          }
        },
        data: {
          status: "READ"
        }
      });
    }

    // Get the next cursor
    const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;

    return NextResponse.json({
      messages: messages.reverse(), // Return in chronological order
      nextCursor
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST to send a new message or save a draft
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { conversationId } = await params;
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

    const { content, isDraft = false } = await req.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: userId,
        conversationId,
        isDraft,
        status: isDraft ? "DRAFT" : "SENT"
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    // If it's not a draft, update the conversation's updatedAt time
    if (!isDraft) {
      await prisma.conversation.update({
        where: {
          id: conversationId
        },
        data: {
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
