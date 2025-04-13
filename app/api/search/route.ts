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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const courseId = searchParams.get('courseId');
    const role = searchParams.get('role');

    // Initialize the query conditions
    const whereConditions: any = {
      // Don't include the current user in search results
      id: { not: userId }
    };

    // Add search term if provided
    if (query) {
      whereConditions.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Filter by role if provided (STUDENT, PROFESSOR, or ADMIN)
    if (role && ['STUDENT', 'PROFESSOR', 'ADMIN'].includes(role)) {
      whereConditions.role = role;
    }

    // If courseId is provided, filter users enrolled in that course
    if (courseId) {
      // Check if the current user is part of this course
      const userInCourse = await prisma.user.findFirst({
        where: {
          id: userId,
          OR: [
            { enrolledCourses: { some: { id: courseId } } },
            { teachingCourses: { some: { id: courseId } } }
          ]
        }
      });

      if (!userInCourse) {
        return NextResponse.json(
          { error: "Not authorized to search users in this course" },
          { status: 403 }
        );
      }

      // For course-specific search, adapt the query
      delete whereConditions.OR; // Remove the previous OR condition

      whereConditions.OR = [
        {
          enrolledCourses: { some: { id: courseId } },
          ...(query ? {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          } : {})
        },
        {
          teachingCourses: { some: { id: courseId } },
          ...(query ? {
            OR: [
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          } : {})
        }
      ];
    }

    // Execute the search query
    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        // Include whether the user teaches or is enrolled in the specified course
        ...(courseId ? {
          enrolledCourses: {
            where: { id: courseId },
            select: { id: true, name: true, code: true }
          },
          teachingCourses: {
            where: { id: courseId },
            select: { id: true, name: true, code: true }
          }
        } : {})
      },
      take: limit
    });

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      ...(courseId ? {
        courseRelation: user.teachingCourses?.length > 0 
          ? 'PROFESSOR' 
          : user.enrolledCourses?.length > 0 
            ? 'STUDENT' 
            : null
      } : {})
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
