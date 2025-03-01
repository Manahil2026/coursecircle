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
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, code, description, professorId } = data;
    
    // Validate required fields
    if (!name || !code || !professorId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, code, or professorId' },
        { status: 400 }
      );
    }
    
    // Check if professor exists
    const professor = await prisma.user.findUnique({
      where: { id: professorId }
    });
    
    if (!professor) {
      return NextResponse.json(
        { error: 'Professor not found' },
        { status: 404 }
      );
    }
    
    // Create the course
    const course = await prisma.course.create({
      data: {
        name,
        code,
        description: description || '',
        professor: { connect: { id: professorId } }
      },
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
