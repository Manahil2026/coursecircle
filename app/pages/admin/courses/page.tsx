"use client";
import React, { useState, useEffect } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import SectionNavLinks from "@/app/components/section_nav_links";
import CourseForm from "@/app/components/course_form";

// Interface definitions
interface Professor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  professor: Professor;
  professorId: string;
  students: Student[];
  assignments: Assignment[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
}

const AdminCoursesPage: React.FC = () => {
  // State for course management
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Enrollment states
  const [enrollmentCourse, setEnrollmentCourse] = useState<string>("");
  const [enrollmentStudents, setEnrollmentStudents] = useState<string[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin navigation links
  const adminLinks = [
    { key: "dashboard", label: "Dashboard", path: "/pages/admin/dashboard" },
    { key: "courses", label: "Courses", path: "/pages/admin/courses" },
    { key: "users", label: "Users", path: "/pages/admin/users" }
  ];
  
  // Fetch courses and users when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses
        const coursesResponse = await fetch('/api/admin/courses');
        if (!coursesResponse.ok) throw new Error('Failed to fetch courses');
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses);
        
        // Fetch users for the enrollment form
        const usersResponse = await fetch('/api/admin/users');
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      } catch (err) {
        setError('Error loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Create new course
  const createCourse = async (courseData: {
    name: string;
    code: string;
    description: string;
    professorId: string;
  }) => {
    try {
      // Validate form
      if (!courseData.name || !courseData.code || !courseData.professorId) {
        setError('Please fill in all required fields');
        return;
      }
      
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create course');
      }
      
      const { course } = await response.json();
      
      // Add new course to state
      setCourses(prevCourses => [...prevCourses, course]);
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error(err);
    }
  };
  
  // Enroll students in course
  const enrollStudents = async () => {
    try {
      if (!enrollmentCourse || enrollmentStudents.length === 0) {
        setError('Please select a course and at least one student');
        return;
      }
      
      const response = await fetch(`/api/admin/courses/${enrollmentCourse}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: enrollmentStudents })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enroll students');
      }
      
      // Update courses state with new enrollment data
      const { course } = await response.json();
      setCourses(prevCourses => 
        prevCourses.map(c => c.id === course.id ? 
          { ...c, students: course.students } : c
        )
      );
      
      // Reset form
      setEnrollmentCourse("");
      setEnrollmentStudents([]);
      
      // Clear any previous errors and show success
      setError(null);
      alert('Students enrolled successfully');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error(err);
    }
  };
  
  // Handle multi-select for student enrollment
  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map(option => option.value);
    setEnrollmentStudents(values);
  };

  return (
    <>
      <Sidebar_dashboard />
      <div className="flex h-full bg-gray-100 flex-1 pl-16">
        {/* Admin Menu Sidebar */}
        <div className="w-64 bg-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
          <SectionNavLinks links={adminLinks} activePage="courses" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold">Course Management</h1>
          
          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Course Creation Using CourseForm Component */}
          <CourseForm onCreateCourse={createCourse} />

          {/* Student Enrollment Section */}
          <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
            <h2 className="text-xl font-semibold">Enroll Students in Course</h2>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Course</label>
                <select
                  value={enrollmentCourse}
                  onChange={(e) => setEnrollmentCourse(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-md"
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Students (hold Ctrl/Cmd to select multiple)</label>
                <select
                  multiple
                  value={enrollmentStudents}
                  onChange={handleStudentSelect}
                  className="w-full mt-2 p-2 border rounded-md h-40"
                >
                  {users
                    .filter(user => user.role === 'STUDENT')
                    .map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.email})
                      </option>
                    ))}
                </select>
              </div>
              <button
                onClick={enrollStudents}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700"
              >
                Enroll Students
              </button>
            </div>
          </div>

          {/* Course List */}
          <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
            <h3 className="text-xl font-semibold mb-4">Available Courses</h3>
            {loading ? (
              <p className="text-gray-500 mt-2">Loading courses...</p>
            ) : (
              <ul className="space-y-4 mt-4">
                {courses.length === 0 ? (
                  <p className="text-gray-500">No courses available</p>
                ) : (
                  courses.map((course) => (
                    <li
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className="p-4 rounded-md shadow-sm cursor-pointer hover:bg-gray-200"
                    >
                      <h4 className="font-semibold">{course.name}</h4>
                      <p className="text-sm text-gray-700">{course.code}</p>
                      <p>{course.description}</p>
                      <p className="text-sm text-gray-500">
                        Professor: {course.professor.firstName} {course.professor.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Students: {course.students ? course.students.length : 0}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCoursesPage;
