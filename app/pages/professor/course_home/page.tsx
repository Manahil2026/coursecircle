"use client";
import React from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";

const Coursepage: React.FC = () => {
  return (
    <>
      <Sidebar_dashboard />
      <div className="flex h-screen bg-gray-100 flex-1 pl-16">
        {/* Course Menu Sidebar */}
        <div className="w-64 bg-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Course Menu</h2>
          <ul className="space-y-2">
            <li className="p-3 bg-black text-white rounded-md cursor-pointer">
              Assignments
            </li>
            <li className="p-3 bg-gray-100 rounded-md hover:bg-gray-300 cursor-pointer">
              Syllabus
            </li>
            <li className="p-3 bg-gray-100 rounded-md hover:bg-gray-300 cursor-pointer">
              Gradebook
            </li>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold">Professor Dashboard</h1>

          {/* Assignment Creation UI */}
          <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
            <h2 className="text-lg font-semibold mb-4">Create Assignment</h2>
            <input
              type="text"
              placeholder="Title"
              className="block w-full p-2 border rounded-md mb-2"
            />
            <textarea
              placeholder="Description"
              className="block w-full p-2 border rounded-md mb-2"
            ></textarea>
            <input
              type="date"
              className="block w-full p-2 border rounded-md mb-2"
            />
            <button className="px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-blue-700">
              Add Assignment
            </button>
          </div>
        </div>

        {/* Assignment List */}
        <div className="w-80 bg-white p-6 shadow-md border-l border-gray-300">
          <h2 className="text-lg font-semibold mb-4">Assignments</h2>
          <ul className="space-y-4">
            <li className="p-4 bg-gray-100 rounded-md shadow-sm cursor-pointer hover:bg-gray-200">
              <h3 className="text-md font-semibold">Sample Assignment</h3>
              <p className="text-sm text-gray-600">Course: Introduction to Web Development</p>
              <p className="text-sm text-gray-600">Student: John Doe</p>
              <p className="text-sm text-gray-600">Context: Student submission details...</p>
              <input
                type="number"
                placeholder="Enter grade"
                className="block w-full p-2 border rounded-md mt-2"
              />
              <button className="mt-2 px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-blue-700">
                Submit Grade
              </button>
              <span className="text-xs text-red-500 font-semibold block mt-2">Due: Feb 10, 2025</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Coursepage;
