// app/api/conversations/route.ts
// route handler for getting all conversations for specific user and creating new conversations
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// GET all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
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
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          where: {
            isDraft: false // Exclude draft messages
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Format the conversations for the frontend
    const formattedConversations = conversations.map(conversation => {
      const otherParticipants = conversation.participants
        .filter(p => p.userId !== userId)
        .map(p => p.user);
      
      // For one-on-one conversations, use the other person's name
      // For group conversations, use the group name or list of participants
      const name = conversation.isGroup ? 
        conversation.name || otherParticipants.map(p => `${p.firstName} ${p.lastName}`).join(', ') :
        otherParticipants.length > 0 ? 
          `${otherParticipants[0].firstName} ${otherParticipants[0].lastName}` :
          'Conversation';

      return {
        id: conversation.id,
        name,
        isGroup: conversation.isGroup,
        participants: otherParticipants,
        lastMessage: conversation.messages[0] || null,
        updatedAt: conversation.updatedAt
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST to create a new conversation
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { participantIds, name, isGroup, courseId } = await req.json();

    // Validate required fields
    if (!participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: "Invalid participant IDs" },
        { status: 400 }
      );
    }

    // Ensure current user is included in participants
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    // For 1-on-1 conversations, check if a conversation already exists
    if (!isGroup && participantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          AND: [
            {
              participants: {
                some: {
                  userId: participantIds[0]
                }
              }
            },
            {
              participants: {
                some: {
                  userId: participantIds[1]
                }
              }
            }
          ]
        },
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
      });

      if (existingConversation) {
        return NextResponse.json(existingConversation);
      }
    }

    // Create the conversation data
    const conversationData: any = {
      name: isGroup ? name : undefined,
      isGroup: isGroup || false,
      participants: {
        create: participantIds.map(id => ({
          userId: id,
          isAdmin: id === userId // Make the creator an admin for group chats
        }))
      }
    };

    // Add course relationship if courseId is provided
    if (courseId) {
      // Verify the course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });
      
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      
      conversationData.courseId = courseId;
    }

    // Create a new conversation
    const newConversation = await prisma.conversation.create({
      data: conversationData,
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
    });

    return NextResponse.json(newConversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
