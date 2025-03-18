'use client';

import CourseCard from '@/app/components/course_card';

export default function TestPage() {
  const sampleCourseData = {
    courseId: "123",
    courseName: "Computer Science 101",
    assignmentsDue: 3,
    notifications: 5,
    schedule: "MWF",
    upcomingClassDate: "March 15"
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-8">Course Card Component Test</h1>
      
      <div className="space-y-6">
        {/* Example with different data */}
        <CourseCard
          courseId={sampleCourseData.courseId}
          courseName={sampleCourseData.courseName}
          assignmentsDue={sampleCourseData.assignmentsDue}
          notifications={sampleCourseData.notifications}
          schedule={sampleCourseData.schedule}
          upcomingClassDate={sampleCourseData.upcomingClassDate}
        />

        {/* Another example with different data */}
        <CourseCard
          courseId="456"
          courseName="Data Structures"
          assignmentsDue={2}
          notifications={1}
          schedule="TTh"
          upcomingClassDate="March 16"
        />

        {/* One more example */}
        <CourseCard
          courseId="789"
          courseName="Web Development"
          assignmentsDue={5}
          notifications={3}
          schedule="MW"
          upcomingClassDate="March 17"
        />
      </div>
    </div>
  );
} 