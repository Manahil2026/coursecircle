// app/api/messages/[messageId]/route.ts
// route handler for operations for specific messages 
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

interface Params {
  params: { messageId: string };
}

// GET a specific message
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { messageId } = await params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        conversation: {
          include: {
            participants: {
              where: {
                userId: userId
              }
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if the user is a participant in the conversation
    if (message.conversation.participants.length === 0) {
      return NextResponse.json(
        { error: "Not authorized to view this message" },
        { status: 403 }
      );
    }

    // Check if trying to access someone else's draft
    if (message.isDraft && message.senderId !== userId) {
      return NextResponse.json(
        { error: "Cannot access another user's draft message" },
        { status: 403 }
      );
    }

    // Mark the message as read if it wasn't sent by the current user
    if (message.senderId !== userId && message.status === "SENT") {
      await prisma.message.update({
        where: { id: messageId },
        data: { status: "READ" }
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

// PATCH to update a message (edit a draft or mark as read)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { messageId } = await params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the message to check permissions
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            participants: {
              where: {
                userId: userId
              }
            }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if the user is a participant in the conversation
    if (message.conversation.participants.length === 0) {
      return NextResponse.json(
        { error: "Not authorized to modify this message" },
        { status: 403 }
      );
    }

    const { content, isDraft, status } = await req.json();
    const updateData: any = {};

    // Only the sender can edit content or draft status
    if (message.senderId === userId) {
      // Can only edit drafts or very recent messages (e.g., within 5 minutes)
      const canEditContent = message.isDraft || 
        (Date.now() - new Date(message.createdAt).getTime() < 5 * 60 * 1000);
      
      if (content !== undefined && canEditContent) {
        updateData.content = content;
      } else if (content !== undefined && !canEditContent) {
        return NextResponse.json(
          { error: "Can only edit draft messages or recent messages" },
          { status: 400 }
        );
      }

      if (isDraft !== undefined) {
        // Can only toggle draft status on draft messages
        if (!message.isDraft && isDraft) {
          return NextResponse.json(
            { error: "Cannot convert a sent message to a draft" },
            { status: 400 }
          );
        }
        updateData.isDraft = isDraft;
        
        // If message is being sent (draft -> not draft)
        if (message.isDraft && !isDraft) {
          updateData.status = "SENT";
          
          // Update conversation timestamp
          await prisma.conversation.update({
            where: { id: message.conversationId },
            data: { updatedAt: new Date() }
          });
        }
      }
    }

    // Anyone in the conversation can mark a message as read
    if (status === "READ" && message.status === "SENT" && message.senderId !== userId) {
      updateData.status = "READ";
    }

    // If there's nothing to update, return an error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: updateData,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE a message
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { messageId } = await params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the message to check permissions
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Only the sender can delete their message
    if (message.senderId !== userId) {
      return NextResponse.json(
        { error: "Can only delete your own messages" },
        { status: 403 }
      );
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
