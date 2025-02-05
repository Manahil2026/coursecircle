"use client";
import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";

const assignments = [
  {
    id: 1,
    title: "React Components",
    description: "Build reusable React components for a UI library.",
    details: "In this assignment, you will create reusable React components using props and state. Focus on building modular UI elements.",
    dueDate: "Due: Feb 10, 2025",
  },
  {
    id: 2,
    title: "Next.js API Routes",
    description: "Create and deploy API routes using Next.js.",
    details: "This assignment requires you to build API routes in Next.js. Learn how to handle GET and POST requests efficiently.",
    dueDate: "Due: Feb 15, 2025",
  },
  {
    id: 3,
    title: "Tailwind CSS Styling",
    description: "Style a responsive webpage using Tailwind CSS.",
    details: "Use Tailwind CSS utility classes to create a fully responsive webpage. Pay attention to flexbox and grid layouts.",
    dueDate: "Due: Feb 20, 2025",
  },
];

const Coursepage: React.FC = () => {
  const [selectedAssignment, setSelectedAssignment] = useState<null | (typeof assignments)[0]>(null);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Existing Sidebar */}
      <Sidebar_dashboard />

      {/* Course Menu Sidebar */}
      <div className="w-64 bg-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Course Menu</h2>
        <ul className="space-y-2">
          <li className="p-3 bg-black text-white rounded-md cursor-pointer">
            Assignment
          </li>
          <li className="p-3 bg-gray-100 rounded-md hover:bg-gray-300 cursor-pointer">
            Syllabus
          </li>
          <li className="p-3 bg-gray-100 rounded-md hover:bg-gray-300 cursor-pointer">
            Grade
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Welcome to the Course</h1>
        <p className="text-gray-600 mt-2">
          Here you will find all the course materials, assignments, and grades.
        </p>

        {/* Display Selected Assignment */}
        {selectedAssignment && (
          <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
            <h2 className="text-xl font-semibold">{selectedAssignment.title}</h2>
            <p className="text-gray-700 mt-2">{selectedAssignment.details}</p>
            <p className="text-red-500 font-semibold mt-2">{selectedAssignment.dueDate}</p>

            <button className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-blue-700 transition">
              Upload Assignment
            </button>
          </div>
        )}
      </div>

      {/* Right Section: List of Assignments */}
      <div className="w-80 bg-white p-6 shadow-md border-l border-gray-300">
        <h2 className="text-lg font-semibold mb-4">Assignments</h2>
        <ul className="space-y-4">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              onClick={() => setSelectedAssignment(assignment)}
              className={`p-4 rounded-md shadow-sm cursor-pointer transition ${
                selectedAssignment?.id === assignment.id
                  ? "bg-blue-100 border-l-4 border-[#AAFF45]"
                  : "bg-gray-100"
              } hover:bg-gray-200`}
              title="Click to View Assignment"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold">{assignment.title}</h3>
                <span className="text-xs text-red-500 font-semibold">
                  {assignment.dueDate}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{assignment.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Coursepage;
