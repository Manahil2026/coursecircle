"use client";

import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import { useState } from "react";

interface Assignment {
  name: string;
  dueDate: string;
  submissionDate: string;
  score: number;
}

interface Student {
  id: number;
  name: string;
  assignments: Assignment[];
  attendance: number;
}

export default function GradeTracker() {
  const [student] = useState<Student>({
    id: 1,
    name: "John Doe",
    assignments: [
      {
        name: "Math Homework",
        dueDate: "2025-01-10",
        submissionDate: "2025-01-11",
        score: 80,
      },
      {
        name: "Science Project",
        dueDate: "2025-01-15",
        submissionDate: "2025-01-14",
        score: 90,
      },
      {
        name: "History Essay",
        dueDate: "2025-01-20",
        submissionDate: "2025-01-22",
        score: 85,
      },
    ],
    attendance: 90,
  });

  const calculateGrade = (assignments: Assignment[]): string => {
    const total = assignments.reduce(
      (acc, assignment) => acc + assignment.score,
      0
    );
    return (total / assignments.length).toFixed(2);
  };

  return (
    <>
      <Sidebar_dashboard />
      <CourseMenu />
      <div className="p-6 max-w-4xl mx-auto rounded-lg">
        <h1 className="text-base font-medium mb-2 text-center text-black">
          Your Grades [ Python Programming ]
        </h1>

        {/* Student Detail Section */}
        {student && (
          <div className="border rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-medium mb-2 text-black">
              {student.name}
            </h2>
            <table className="w-full table-auto border-collapse text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="px-4 py-2">Assignment Name</th>
                  <th className="px-4 py-2">Due Date</th>
                  <th className="px-4 py-2">Submission Date</th>
                  <th className="px-4 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {student.assignments.map((assignment, index) => (
                  <tr key={index} className="odd:bg-gray-50 border-b">
                    <td className="px-4 py-2">{assignment.name}</td>
                    <td className="px-4 py-2">{assignment.dueDate}</td>
                    <td className="px-4 py-2">{assignment.submissionDate}</td>
                    <td className="px-4 py-2">{assignment.score}</td>
                  </tr>
                ))}
                {/* Average Grade */}
                <tr className="bg-gray-100 font-medium">
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-right bg-[#AAFF45] border-b-[1px] border-black"
                  >
                    Average Grade
                  </td>
                  <td className="px-4 py-2 bg-[#AAFF45] border-b-[1px] border-black">
                    {calculateGrade(student.assignments)}
                  </td>
                </tr>
                {/* Attendance */}
                <tr className="bg-gray-100 font-medium">
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-right bg-[#AAFF45] border-b-[1px] border-black"
                  >
                    Attendance (%)
                  </td>
                  <td className="px-4 py-2 border-b-[1px] border-black bg-[#AAFF45]">
                    {student.attendance}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
