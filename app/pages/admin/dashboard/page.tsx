//updated dashboard 3/1. Key changes:
//updated interface definitions and form fields to match prisma schema
//add useEffect hook to fetch courses from the api endpoint at app/api/admin/courses/route.ts
//
// app/pages/admin/dashboard/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";

// Updated interface definitions to match the database schema
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

// Updated User interface to match database schema
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
}

const AdminDashboard: React.FC = () => {
  // State for selected course, courses list, and users list
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    description: "",
    professorId: ""
  });
  
  const [newUser, setNewUser] = useState<{ 
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    role: "STUDENT"
  });

  // Fetch courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/courses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        setCourses(data.courses);
      } catch (err) {
        setError('Error loading courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Create new course
  const createCourse = async () => {
    try {
      // Validate form
      if (!newCourse.name || !newCourse.code || !newCourse.professorId) {
        setError('Please fill in all required fields');
        return;
      }
      
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create course');
      }
      
      const { course } = await response.json();
      
      // Add new course to state
      setCourses(prevCourses => [...prevCourses, course]);
      
      // Reset form
      setNewCourse({
        name: "",
        code: "",
        description: "",
        professorId: ""
      });
      
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
  
  // Handle input changes for course form
  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Create new user (stub for now)
  const createUser = () => {
    // This will be implemented in the user API route
    console.log("Creating user:", newUser);
  };
  
  // Handle input changes for user form
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
    <Sidebar_dashboard/>
    <div className="flex h-full bg-gray-100 flex-1 pl-16">
      {/* Admin Menu Sidebar */}
      <div className="w-64 bg-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
        <ul className="space-y-2">
          <li className="p-3 bg-black text-white rounded-md cursor-pointer">
            Courses
          </li>
          <li className="p-3 bg-gray-100 rounded-md hover:bg-gray-300 cursor-pointer">
            Users
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        
        {/* Error message display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Course Management Section */}
        <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
          <h2 className="text-xl font-semibold">Create New Course</h2>
          <div className="space-y-4 mt-4">
            <div>
              <input
                type="text"
                name="name"
                value={newCourse.name}
                onChange={handleCourseInputChange}
                className="w-full mt-2 p-2 border rounded-md"
                placeholder="Course Name"
              />
            </div>
            <div>
              <input
                type="text"
                name="code"
                value={newCourse.code}
                onChange={handleCourseInputChange}
                className="w-full mt-2 p-2 border rounded-md"
                placeholder="Course Code (e.g., CS101)"
              />
            </div>
            <div>
              <textarea
                name="description"
                value={newCourse.description}
                onChange={handleCourseInputChange}
                className="w-full mt-2 p-2 border rounded-md"
                placeholder="Course Description"
                rows={3}
              />
            </div>
            <div>
              <input
                type="text"
                name="professorId"
                value={newCourse.professorId}
                onChange={handleCourseInputChange}
                className="w-full mt-2 p-2 border rounded-md"
                placeholder="Professor ID"
              />
            </div>
            <button
              onClick={createCourse}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
            >
              Create Course
            </button>
          </div>

          <h3 className="mt-6 font-semibold">Available Courses</h3>
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
                      Students: {course.students.length}
                    </p>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* User Management Section */}
        <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
          <h2 className="text-xl font-semibold">Create New User</h2>
          <div className="space-y-4 mt-4">
            <div>
              <input
                type="text"
                name="firstName"
                value={newUser.firstName}
                onChange={handleUserInputChange}
                className="w-full mt-2 p-2 border rounded-md"
                placeholder="First Name"
              />
            </div>
            <div>
              <input
                type="text"
                name="lastName"
                value={newUser.lastName}
                onChange={handleUserInputChange}
                className="w-full mt-2 p-2 border rounded-md"
                placeholder="Last Name"
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleUserInputChange}
                className="w-full mt-2 p-2 border rounded-md"
                placeholder="Email"
              />
            </div>
            <div>
              <select
                name="role"
                value={newUser.role}
                onChange={handleUserInputChange}
                className="w-full mt-2 p-2 border rounded-md"
              >
                <option value="STUDENT">Student</option>
                <option value="PROFESSOR">Professor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button
              onClick={createUser}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700"
            >
              Create User
            </button>
          </div>

          <h3 className="mt-6 font-semibold">Users</h3>
          <p className="text-gray-500 mt-2">User management is not yet implemented</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
