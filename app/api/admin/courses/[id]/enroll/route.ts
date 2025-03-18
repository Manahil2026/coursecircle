import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST to enroll students in a course
export async function POST(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const { studentIds } = await request.json();
    
    // Validate studentIds
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'No student IDs provided' },
        { status: 400 }
      );
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Check if all students exist
    const students = await prisma.user.findMany({
      where: { 
        id: { in: studentIds },
        role: 'STUDENT'
      }
    });
    
    if (students.length !== studentIds.length) {
      return NextResponse.json(
        { error: 'One or more students not found or not of role STUDENT' },
        { status: 404 }
      );
    }
    
    // Update the course by connecting the students
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: studentIds.map(id => ({ id }))
        }
      },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: `${studentIds.length} students enrolled successfully`,
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error enrolling students:', error);
    return NextResponse.json(
      { error: 'Failed to enroll students' },
      { status: 500 }
    );
  }
}

// DELETE to remove students from a course
export async function DELETE(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;
    const { studentIds } = await request.json();
    
    // Validate studentIds
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'No student IDs provided' },
        { status: 400 }
      );
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Update the course by disconnecting the students
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          disconnect: studentIds.map(id => ({ id }))
        }
      },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    return NextResponse.json({ 
      success: true,
      message: `${studentIds.length} students removed successfully`,
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error removing students:', error);
    return NextResponse.json(
      { error: 'Failed to remove students' },
      { status: 500 }
    );
  }
}
