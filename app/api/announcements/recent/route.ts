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

    // Get all courses the student is enrolled in
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrolledCourses: {
          select: { id: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get course IDs the student is enrolled in
    const courseIds = user.enrolledCourses.map(course => course.id);

    // Find conversations that are announcements for the student's courses
    const announcements = await prisma.conversation.findMany({
      where: {
        isAnnouncement: true,
        courseId: { in: courseIds },
        participants: {
          some: { userId }
        }
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Transform the data for the frontend
    const recentAnnouncements = announcements.map(announcement => {
      const latestMessage = announcement.messages[0];
      
      return {
        id: announcement.id,
        courseId: announcement.courseId,
        courseCode: announcement.course?.code,
        courseName: announcement.course?.name,
        messagePreview: latestMessage ? latestMessage.content.replace(/<[^>]*>?/gm, '').substring(0, 100) : "",
        timestamp: latestMessage ? latestMessage.createdAt : announcement.updatedAt,
        sender: latestMessage ? `${latestMessage.sender.firstName} ${latestMessage.sender.lastName}` : ""
      };
    });

    return NextResponse.json(recentAnnouncements);
  } catch (error) {
    console.error("Error fetching recent announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}
