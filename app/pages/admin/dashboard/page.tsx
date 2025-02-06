"use client";
import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";

// User types for Admin Dashboard
interface User {
  id: number;
  name: string;
  role: "professor" | "student";
}

interface Course {
  id: number;
  title: string;
  description: string;
  professor: string;
  students: string[];
  assignments: { id: number; title: string; dueDate: string }[];
}

const AdminDashboard: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [users, setUsers] = useState<User[]>([]); // Manage Users (professors and students)
  const [courses, setCourses] = useState<Course[]>([]); // Manage Courses
  const [newCourse, setNewCourse] = useState<string>(""); // New Course creation
  const [newUser, setNewUser] = useState<{ name: string; role: string }>({
    name: "",
    role: "student",
  });

  // Create new course
  const createCourse = () => {
    if (newCourse) {
      const courseId = courses.length + 1;
      const newCourseObj: Course = {
        id: courseId,
        title: newCourse,
        description: "Course Description",
        professor: "",
        students: [],
        assignments: [],
      };
      setCourses([...courses, newCourseObj]);
      setNewCourse("");
    }
  };

  // Create new user
  const createUser = () => {
    const newUserId = users.length + 1;
    const newUserObj: User = {
      id: newUserId,
      name: newUser.name,
      role: newUser.role as "professor" | "student",
    };
    setUsers([...users, newUserObj]);
    setNewUser({ name: "", role: "student" });
  };

  return (
    <>
    <Sidebar_dashboard/>
    <div className="flex h-full bg-gray-100 flex-1 pl-16">
      {/* Existing Sidebar */}
      

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

        {/* Course Management Section */}
        <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
          <h2 className="text-xl font-semibold">Create New Course</h2>
          <input
            type="text"
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
            className="mt-2 p-2 border rounded-md"
            placeholder="Course Name"
          />
          <button
            onClick={createCourse}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
          >
            Create Course
          </button>

          <h3 className="mt-6 font-semibold">Available Courses</h3>
          <ul className="space-y-4">
            {courses.map((course) => (
              <li
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="p-4 rounded-md shadow-sm cursor-pointer hover:bg-gray-200"
              >
                <h4 className="font-semibold">{course.title}</h4>
                <p>{course.description}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* User Management Section */}
        <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
          <h2 className="text-xl font-semibold">Create New User</h2>
          <input
            type="text"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="mt-2 p-2 border rounded-md"
            placeholder="User Name"
          />
          <select
            value={newUser.role}
            onChange={(e) =>
              setNewUser({ ...newUser, role: e.target.value })
            }
            className="mt-2 p-2 border rounded-md"
          >
            <option value="student">Student</option>
            <option value="professor">Professor</option>
          </select>
          <button
            onClick={createUser}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700"
          >
            Create User
          </button>

          <h3 className="mt-6 font-semibold">Users</h3>
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.id} className="p-4 rounded-md shadow-sm">
                <h4 className="font-semibold">{user.name}</h4>
                <p>{user.role}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
