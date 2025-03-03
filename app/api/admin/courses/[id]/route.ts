// Path: app/api/admin/courses/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET a specific course
export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
        assignments: true,
        files: true
      }
    });
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT to update a course
export async function PUT(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const data = await request.json();
    const { name, code, description, professorId } = data;
    
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Create update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (professorId !== undefined) {
      // Verify professor exists if provided
      const professor = await prisma.user.findUnique({
        where: { id: professorId }
      });
      
      if (!professor) {
        return NextResponse.json(
          { error: 'Professor not found' },
          { status: 404 }
        );
      }
      
      updateData.professor = { connect: { id: professorId } };
    }
    
    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        professor: { 
          select: { 
            id: true,
            firstName: true, 
            lastName: true 
          } 
        }
      }
    });
    
    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE a course
export async function DELETE(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Delete the course
    await prisma.course.delete({
      where: { id: courseId }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Course deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
