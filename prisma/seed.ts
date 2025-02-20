import { prisma } from '../lib/prisma.ts'
import { UserRole } from '@prisma/client'

async function main() {
  // First clean the database
  await prisma.assignment.deleteMany({})
  await prisma.file.deleteMany({})
  await prisma.course.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('Cleaned up existing data')

  // Create admin users
  const admin1 = await prisma.user.create({
    data: {
      id: 'admin_1',
      email: 'admin1@university.edu',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  })

  console.log('Created admin user')

  // Create professors
  const professors = []
  for (let i = 1; i <= 15; i++) {
    const professor = await prisma.user.create({
      data: {
        id: `prof_${i}`,
        email: `professor${i}@university.edu`,
        firstName: `Professor`,
        lastName: `${i}`,
        role: UserRole.PROFESSOR,
      },
    })
    professors.push(professor)
  }

  console.log('Created professors')

  // Create students
  const students = []
  for (let i = 1; i <= 100; i++) {
    const student = await prisma.user.create({
      data: {
        id: `student_${i}`,
        email: `student${i}@university.edu`,
        firstName: `Student`,
        lastName: `${i}`,
        role: UserRole.STUDENT,
      },
    })
    students.push(student)
  }

  console.log('Created students')

  // Course subjects and their codes
  const subjects = [
    { name: 'Computer Science', code: 'CS' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Physics', code: 'PHYS' },
    { name: 'Biology', code: 'BIO' },
    { name: 'Chemistry', code: 'CHEM' }
  ]

  // Create courses
  const courses = []
  for (let i = 1; i <= 20; i++) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)]
    const courseNumber = Math.floor(Math.random() * 400) + 100 // Courses between 100-499
    const professor = professors[Math.floor(Math.random() * professors.length)]
    
    // Select random students (between 15-30 students per course)
    const numStudents = Math.floor(Math.random() * 16) + 15
    const courseStudents = students
      .sort(() => Math.random() - 0.5)
      .slice(0, numStudents)

    const course = await prisma.course.create({
      data: {
        name: `${subject.name} ${courseNumber}`,
        code: `${subject.code}${courseNumber}`,
        description: `This is the course description for ${subject.name} ${courseNumber}`,
        professorId: professor.id,
        students: {
          connect: courseStudents.map(student => ({ id: student.id }))
        }
      },
    })

    // Create 3-5 assignments for each course
    const numAssignments = Math.floor(Math.random() * 3) + 3
    for (let j = 1; j <= numAssignments; j++) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 90)) // Due within next 90 days

      await prisma.assignment.create({
        data: {
          title: `Assignment ${j}`,
          description: `This is assignment ${j} for ${course.name}`,
          dueDate,
          courseId: course.id
        }
      })
    }

    // Create 2-4 course files
    const numFiles = Math.floor(Math.random() * 3) + 2
    for (let k = 1; k <= numFiles; k++) {
      await prisma.file.create({
        data: {
          name: `Course Material ${k}`,
          url: `https://example.com/files/${course.id}/material${k}.pdf`,
          type: 'pdf',
          courseId: course.id
        }
      })
    }

    courses.push(course)
  }

  console.log('Created courses with assignments and files')

  // Log some statistics
  console.log('\nSeeding completed! Here are the statistics:')
  console.log('------------------------------------------')
  console.log('Admins created:', 1)
  console.log('Professors created:', professors.length)
  console.log('Students created:', students.length)
  console.log('Courses created:', courses.length)
  const assignmentCount = await prisma.assignment.count()
  console.log('Assignments created:', assignmentCount)
  const fileCount = await prisma.file.count()
  console.log('Files created:', fileCount)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
