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
  enrolledCourses?: { id: string; name: string; code: string }[];
  teachingCourses?: { id: string; name: string; code: string }[];
}

const AdminDashboard: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'courses' | 'users'>('courses');
  
  // Course states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    description: "",
    professorId: ""
  });
  
  // User states
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFilter, setUserFilter] = useState<'ALL' | 'STUDENT' | 'PROFESSOR' | 'ADMIN'>('ALL');
  
  // Enrollment states
  const [enrollmentCourse, setEnrollmentCourse] = useState<string>("");
  const [enrollmentStudents, setEnrollmentStudents] = useState<string[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState({
    courses: true,
    users: true
  });
  const [error, setError] = useState<string | null>(null);
  
  // Fetch courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(prev => ({ ...prev, courses: true }));
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
        setLoading(prev => ({ ...prev, courses: false }));
      }
    };
    
    fetchCourses();
  }, []);
  
  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(prev => ({ ...prev, users: true }));
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users); // Initialize with all users
      } catch (err) {
        setError('Error loading users');
        console.error(err);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users when userFilter changes
  useEffect(() => {
    if (userFilter === 'ALL') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.role === userFilter));
    }
  }, [userFilter, users]);
  
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
  
  // Handle input changes for course form
  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle multi-select for student enrollment
  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map(option => option.value);
    setEnrollmentStudents(values);
  };

  return (
    <>
    <Sidebar_dashboard/>
    <div className="flex h-full bg-gray-100 flex-1 pl-16">
      {/* Admin Menu Sidebar */}
      <div className="w-64 bg-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
        <ul className="space-y-2">
          <li 
            className={`p-3 ${activeTab === 'courses' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-300'} rounded-md cursor-pointer`}
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </li>
          <li 
            className={`p-3 ${activeTab === 'users' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-300'} rounded-md cursor-pointer`}
            onClick={() => setActiveTab('users')}
          >
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

        {/* Courses Tab Content */}
        {activeTab === 'courses' && (
          <>
            {/* Course Creation Section */}
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

              {/* Student Enrollment Section */}
              <h2 className="text-xl font-semibold mt-8">Enroll Students in Course</h2>
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

              <h3 className="mt-6 font-semibold">Available Courses</h3>
              {loading.courses ? (
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
          </>
        )}

        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
            <h2 className="text-xl font-semibold">Users</h2>
            
            {/* User Filter */}
            <div className="mt-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setUserFilter('ALL')}
                  className={`px-4 py-2 rounded-md ${userFilter === 'ALL' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setUserFilter('STUDENT')}
                  className={`px-4 py-2 rounded-md ${userFilter === 'STUDENT' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Students
                </button>
                <button 
                  onClick={() => setUserFilter('PROFESSOR')}
                  className={`px-4 py-2 rounded-md ${userFilter === 'PROFESSOR' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Professors
                </button>
                <button 
                  onClick={() => setUserFilter('ADMIN')}
                  className={`px-4 py-2 rounded-md ${userFilter === 'ADMIN' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Admins
                </button>
              </div>
            </div>
            
            {/* User List */}
            {loading.users ? (
              <p className="text-gray-500">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Courses
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 px-6 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr 
                          key={user.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUser(user)}
                        >
                          <td className="py-2 px-4 whitespace-nowrap">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap">
                            {user.email}
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                user.role === 'PROFESSOR' ? 'bg-green-100 text-green-800' : 
                                'bg-blue-100 text-blue-800'}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-2 px-4 whitespace-nowrap">
                            {user.role === 'PROFESSOR' && user.teachingCourses && (
                              <span>{user.teachingCourses.length} teaching</span>
                            )}
                            {user.role === 'STUDENT' && user.enrolledCourses && (
                              <span>{user.enrolledCourses.length} enrolled</span>
                            )}
                            {user.role === 'ADMIN' && (
                              <span>-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Selected User Details */}
            {selectedUser && (
              <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <p className="text-gray-600">{selectedUser.email}</p>
                <p className="text-gray-600">Role: {selectedUser.role}</p>
                
                {selectedUser.role === 'PROFESSOR' && selectedUser.teachingCourses && (
                  <div className="mt-4">
                    <h4 className="font-medium">Teaching Courses</h4>
                    {selectedUser.teachingCourses.length === 0 ? (
                      <p className="text-gray-500">Not teaching any courses</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {selectedUser.teachingCourses.map(course => (
                          <li key={course.id} className="text-sm">
                            {course.code} - {course.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                {selectedUser.role === 'STUDENT' && selectedUser.enrolledCourses && (
                  <div className="mt-4">
                    <h4 className="font-medium">Enrolled Courses</h4>
                    {selectedUser.enrolledCourses.length === 0 ? (
                      <p className="text-gray-500">Not enrolled in any courses</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {selectedUser.enrolledCourses.map(course => (
                          <li key={course.id} className="text-sm">
                            {course.code} - {course.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
