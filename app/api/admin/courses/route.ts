import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all courses with related data
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        professor: { 
          select: { 
            id: true,
            firstName: true, 
            lastName: true 
          } 
        },
        students: { 
          select: { 
            id: true,
            firstName: true,
            lastName: true
          } 
        },
        assignments: true
      }
    });
    
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST to create a new course
// Updated POST function for app/api/admin/courses/route.ts file

// POST to create a new course
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, code, description, professorId } = data;
    
    // Validate required fields (professorId is now optional)
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: name and code' },
        { status: 400 }
      );
    }
    
    // Check if professor exists if professorId is provided
    if (professorId) {
      const professor = await prisma.user.findUnique({
        where: { id: professorId }
      });
      
      if (!professor) {
        return NextResponse.json(
          { error: 'Professor not found' },
          { status: 404 }
        );
      }
    }
    
    // Create course data object
    const courseData: any = {
      name,
      code,
      description: description || '',
    };
    
    // Only add professor connection if professorId is provided
    if (professorId) {
      courseData.professor = { 
        connect: { id: professorId } 
      };
    }
    
    // Create the course
    const course = await prisma.course.create({
      data: courseData,
      include: {
        professor: { 
          select: { 
            id: true,
            firstName: true, 
            lastName: true 
          } 
        },
        students: { 
          select: { 
            id: true,
            firstName: true,
            lastName: true
          } 
        },
        assignments: true
      }
    });
    
    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
