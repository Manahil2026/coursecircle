import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        // Count of courses for quick reference
        enrolledCourses: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        teachingCourses: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      }
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST to create a new user (though this would typically be handled by Clerk)
// This is more for demonstration/testing purposes
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { id, firstName, lastName, email, role } = data;
    
    // Validate required fields
    if (!id || !firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        id,
        firstName,
        lastName,
        email,
        role
      }
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
