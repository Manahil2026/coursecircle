// app/api/conversations/[conversationId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

interface Params {
  params: { conversationId: string };
}

// GET a single conversation by ID
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

    // Fetch the conversation with participants and latest messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        },
        messages: {
          where: {
            isDraft: false
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Format the conversation data
    const formattedConversation = {
      id: conversation.id,
      name: conversation.name,
      isGroup: conversation.isGroup,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      courseId: conversation.courseId,
      course: conversation.course,
      participants: conversation.participants.map(p => ({
        id: p.user.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        email: p.user.email,
        role: p.user.role,
        isAdmin: p.isAdmin
      })),
      messages: conversation.messages.reverse() // Reverse to get chronological order
    };

    return NextResponse.json(formattedConversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

// PATCH to update a conversation
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { conversationId } = await params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an admin in this conversation
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

    if (!participant.isAdmin && participant.userId !== userId) {
      return NextResponse.json(
        { error: "Only admins can update the conversation" },
        { status: 403 }
      );
    }

    const { name, addParticipants, removeParticipants } = await req.json();
    
    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name;
    }

    // Update the conversation
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData
    });

    // Add new participants if provided
    if (addParticipants && Array.isArray(addParticipants) && addParticipants.length > 0) {
      await Promise.all(
        addParticipants.map(participantId =>
          prisma.conversationParticipant.create({
            data: {
              userId: participantId,
              conversationId: conversationId,
              isAdmin: false
            }
          })
        )
      );
    }

    // Remove participants if provided
    if (removeParticipants && Array.isArray(removeParticipants) && removeParticipants.length > 0) {
      await prisma.conversationParticipant.deleteMany({
        where: {
          conversationId: conversationId,
          userId: {
            in: removeParticipants
          }
        }
      });
    }

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    return NextResponse.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}

// DELETE a conversation
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { conversationId } = await params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an admin in this conversation
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

    if (!participant.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can delete the conversation" },
        { status: 403 }
      );
    }

    // Delete the conversation and all related records (messages, participants)
    await prisma.conversation.delete({
      where: { id: conversationId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
