// app/api/messages/drafts/[draftId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

interface Params {
  params: { draftId: string };
}

// GET a specific draft
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { draftId } = await params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const draft = await prisma.message.findUnique({
      where: {
        id: draftId,
        senderId: userId, // Ensure only the author can access their draft
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
              }
            }
          }
        }
      }
    });

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

// PATCH to update a draft
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { draftId } = await params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify this is the user's draft
    const existingDraft = await prisma.message.findUnique({
      where: {
        id: draftId,
        senderId: userId,
        isDraft: true
      }
    });

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const { content } = await req.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Update the draft
    const updatedDraft = await prisma.message.update({
      where: {
        id: draftId
      },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Error updating draft:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}

// DELETE a draft
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { draftId } = await params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify this is the user's draft
    const existingDraft = await prisma.message.findUnique({
      where: {
        id: draftId,
        senderId: userId,
        isDraft: true
      }
    });

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // Delete the draft
    await prisma.message.delete({
      where: {
        id: draftId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}

// POST to send a draft (convert it from draft to sent message)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { draftId } = await params;
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify this is the user's draft
    const existingDraft = await prisma.message.findUnique({
      where: {
        id: draftId,
        senderId: userId,
        isDraft: true
      },
      include: {
        conversation: true
      }
    });

    if (!existingDraft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // Convert the draft to a sent message
    const sentMessage = await prisma.message.update({
      where: {
        id: draftId
      },
      data: {
        isDraft: false,
        status: "SENT",
        updatedAt: new Date()
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Update the conversation's updatedAt time
    await prisma.conversation.update({
      where: {
        id: existingDraft.conversationId
      },
      data: {
        updatedAt: new Date()
      }
    });

    return NextResponse.json(sentMessage);
  } catch (error) {
    console.error("Error sending draft:", error);
    return NextResponse.json(
      { error: "Failed to send draft" },
      { status: 500 }
    );
  }
}
