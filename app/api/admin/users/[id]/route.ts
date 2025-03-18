import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET a specific user with detailed course information
export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrolledCourses: {
          include: {
            professor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        teachingCourses: {
          include: {
            students: {
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
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT to update a user
export async function PUT(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const data = await request.json();
    const { firstName, lastName, email, role } = data;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create update object with only provided fields
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
    
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
