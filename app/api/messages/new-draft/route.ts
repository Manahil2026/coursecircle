// app/api/messages/new-draft/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// POST to create a draft for a new conversation
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      content, 
      participantIds, 
      isGroup = false, 
      groupName, 
      courseId 
    } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: "At least one recipient is required" },
        { status: 400 }
      );
    }

    // Include current user in participants
    const allParticipantIds = participantIds.includes(userId) 
      ? participantIds 
      : [...participantIds, userId];

    // Create a new conversation
    const conversation = await prisma.conversation.create({
      data: {
        name: isGroup ? groupName : undefined,
        isGroup,
        courseId: courseId || undefined,
        participants: {
          create: allParticipantIds.map(id => ({
            userId: id,
            isAdmin: id === userId
          }))
        }
      }
    });

    // Create the draft message
    const draft = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: userId,
        conversationId: conversation.id,
        isDraft: true,
        status: "DRAFT"
      }
    });

    return NextResponse.json({
      draft,
      conversation
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating new draft:", error);
    return NextResponse.json(
      { error: "Failed to create new draft" },
      { status: 500 }
    );
  }
}
