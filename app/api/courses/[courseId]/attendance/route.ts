import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Attendance Assignment
export async function POST(req: Request) {
  const body = await req.json();
  const { courseId, professorId } = body;

  if (!courseId || !professorId) {
    return new Response(JSON.stringify({ error: "Missing courseId or professorId" }), { status: 400 });
  }

  try {
    // Check if the attendance assignment already exists
    const existingAssignment = await prisma.assignment.findFirst({
      where: { courseId, isAttendanceAssignment: true },
    });

    if (!existingAssignment) {
      // Create the attendance assignment
      await prisma.assignment.create({
        data: {
          title: "Attendance",
          description: "Attendance grades for the semester",
          courseId,
          isAttendanceAssignment: true,
        },
      });
    }

    return new Response(JSON.stringify({ message: "Attendance assignment initialized successfully." }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to initialize attendance assignment." }), { status: 500 });
  }
}

// Retrieve Attendance Records
export async function GET(req: Request, { params }: { params: { courseId: string } }) {
  const { searchParams } = new URL(req.url);
  const courseId = params.courseId;
  const date = searchParams.get("date");

  if (!courseId || !date) {
    return new Response(JSON.stringify({ error: "Missing courseId or date" }), { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { professorId: true },
    });

    if (!course || !course.professorId) {
      return new Response(JSON.stringify({ error: "Professor not found for the course" }), { status: 404 });
    }

    const professorId = course.professorId;

    // Fetch the attendance assignment (create it if it doesn't exist)
    let attendanceAssignment = await prisma.assignment.findFirst({
      where: {
        courseId,
        isAttendanceAssignment: true,
      },
    });

    if (!attendanceAssignment) {
      // Create the attendance assignment if it doesn't exist
      attendanceAssignment = await prisma.assignment.create({
        data: {
          title: "Attendance",
          description: "Attendance grades for the semester",
          courseId,
          isAttendanceAssignment: true,
          points: 100, // Total points for attendance
          published: true,
        },
      });
    }

    // Fetch attendance records for the given date
    let attendanceRecords = await prisma.attendance.findMany({
      where: { courseId, date: new Date(date) },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // If no records exist, initialize attendance for all students in the course
    if (attendanceRecords.length === 0) {
      const students = await prisma.user.findMany({
        where: {
          enrolledCourses: {
            some: { id: courseId },
          },
        },
        select: { id: true, firstName: true, lastName: true },
      });

      await prisma.attendance.createMany({
        data: students.map((student) => ({
          studentId: student.id,
          courseId,
          date: new Date(date),
          status: "UNMARKED",
          professorId,
        })),
      });

      // Fetch the newly created attendance records
      attendanceRecords = await prisma.attendance.findMany({
        where: { courseId, date: new Date(date) },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      });
    }

    return new Response(
      JSON.stringify({ attendanceRecords, professorId, attendanceAssignment }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return new Response(JSON.stringify({ error: "Failed to retrieve attendance records." }), { status: 500 });
  }
}

// Record or Update Attendance
export async function PUT(req: Request) {
  const body = await req.json();
  const { courseId, professorId, date, attendance } = body;

  if (!courseId || !professorId || !date || !attendance) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  try {
    const parsedDate = new Date(date); // Convert date string to Date object

    // Fetch the attendance assignment (create it if it doesn't exist)
    let attendanceAssignment = await prisma.assignment.findFirst({
      where: {
        courseId,
        isAttendanceAssignment: true,
      },
    });

    if (!attendanceAssignment) {
      // Create the attendance assignment if it doesn't exist
      attendanceAssignment = await prisma.assignment.create({
        data: {
          title: "Attendance",
          description: "Attendance grades for the semester",
          courseId,
          isAttendanceAssignment: true,
          points: 100, // Total points for attendance
          published: true,
        },
      });
    }

    // Upsert attendance records for the given date
    for (const { studentId, status } of attendance) {
      await prisma.attendance.upsert({
        where: {
          studentId_courseId_date: { studentId, courseId, date: parsedDate },
        },
        update: { status },
        create: { studentId, courseId, professorId, date: parsedDate, status },
      });
    }

    // Calculate grades based on attendance records
    const students = await prisma.user.findMany({
      where: {
        enrolledCourses: {
          some: { id: courseId },
        },
      },
      select: { id: true },
    });

    for (const student of students) {
      const presentCount = await prisma.attendance.count({
        where: {
          studentId: student.id,
          courseId,
          status: "PRESENT",
        },
      });

      const totalCount = await prisma.attendance.count({
        where: {
          studentId: student.id,
          courseId,
          NOT: { status: "UNMARKED" }, // Exclude unmarked attendance
        },
      });

      const grade = totalCount > 0 ? (presentCount / totalCount) * 100 : null;

      await prisma.submission.upsert({
        where: {
          studentId_assignmentId: { studentId: student.id, assignmentId: attendanceAssignment.id },
        },
        update: { 
          grade,
          status: grade !== null ? "GRADED" : "DRAFT", // Set status based on grade 
        },
        create: {
          studentId: student.id,
          assignmentId: attendanceAssignment.id,
          grade,
          status: grade !== null ? "GRADED" : "DRAFT", // Set status based on grade
        },
      });
    }

    return new Response(JSON.stringify({ message: "Attendance recorded and grades updated successfully." }), { status: 200 });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return new Response(JSON.stringify({ error: "Failed to record attendance." }), { status: 500 });
  }
}