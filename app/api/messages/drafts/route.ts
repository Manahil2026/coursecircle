// app/api/messages/drafts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// GET all draft messages for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drafts = await prisma.message.findMany({
      where: {
        senderId: userId,
        isDraft: true
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              },
              where: {
                userId: {
                  not: userId
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format the draft messages
    const formattedDrafts = drafts.map(draft => {
      const otherParticipants = draft.conversation.participants
        .map(p => p.user);
      
      // For one-on-one conversations, use the other person's name
      // For group conversations, use the group name or list of participants
      const conversationName = draft.conversation.isGroup ? 
        draft.conversation.name || otherParticipants.map(p => `${p.firstName} ${p.lastName}`).join(', ') :
        otherParticipants.length > 0 ? 
          `${otherParticipants[0].firstName} ${otherParticipants[0].lastName}` :
          'Conversation';

      return {
        id: draft.id,
        content: draft.content,
        conversationId: draft.conversationId,
        conversationName,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt
      };
    });

    return NextResponse.json(formattedDrafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

// POST to create a new draft
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, conversationId } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
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

    // Create the draft message
    const draft = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: userId,
        conversationId,
        isDraft: true,
        status: "DRAFT"
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    console.error("Error creating draft:", error);
    return NextResponse.json(
      { error: "Failed to create draft" },
      { status: 500 }
    );
  }
}
