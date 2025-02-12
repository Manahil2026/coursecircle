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
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "John Doe",
      assignments: [
        { name: "Math Homework", dueDate: "2025-01-10", submissionDate: "2025-01-11", score: 80 },
        { name: "Science Project", dueDate: "2025-01-15", submissionDate: "2025-01-14", score: 90 },
        { name: "History Essay", dueDate: "2025-01-20", submissionDate: "2025-01-22", score: 85 },
      ],
      attendance: 90,
    },
    {
      id: 2,
      name: "Jane Smith",
      assignments: [
        { name: "Math Homework", dueDate: "2025-01-10", submissionDate: "2025-01-12", score: 75 },
        { name: "Science Project", dueDate: "2025-01-15", submissionDate: "2025-01-16", score: 88 },
        { name: "History Essay", dueDate: "2025-01-20", submissionDate: "2025-01-20", score: 92 },
      ],
      attendance: 95,
    },
  ]);

  // State for managing selected student and arrow toggle
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1); // First student is selected by default
  const [isArrowDown, setIsArrowDown] = useState<boolean>(true);

  const selectStudent = (id: number) => {
    setSelectedStudentId(id === selectedStudentId ? 0 : id); // Toggle the student selection
    setIsArrowDown(!isArrowDown); // Toggle arrow direction
  };

  const calculateGrade = (assignments: Assignment[]): string => {
    const total = assignments.reduce((acc, assignment) => acc + assignment.score, 0);
    return (total / assignments.length).toFixed(2);
  };

  const handleScoreChange = (studentId: number, assignmentIndex: number, newScore: number) => {
    setStudents((prevStudents) => {
      return prevStudents.map((student) => {
        if (student.id === studentId) {
          const updatedAssignments = student.assignments.map((assignment, index) => {
            if (index === assignmentIndex) {
              return { ...assignment, score: newScore };
            }
            return assignment;
          });
          return { ...student, assignments: updatedAssignments };
        }
        return student;
      });
    });
  };

  const selectedStudent = students.find((student) => student.id === selectedStudentId);

  return (
    <>
      <Sidebar_dashboard />
      <CourseMenu />
      <div className="p-6 max-w-4xl mx-auto rounded-lg">
        <h1 className="text-base font-medium mb-2 text-center text-black">Student Grade [ Python Programming ]</h1>

        {/* Student List Section */}
        <div className="mb-2">
          <ul className="space-y-1">
            {students.map((student) => (
              <li key={student.id}>
                <button
                  onClick={() => selectStudent(student.id)}
                  className="w-full text-left p-2 shadow-md hover:bg-gray-300 transition-colors focus:outline-none border-b-[1px] border-black"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-black">{student.name}</span>
                    <span
                      className={`transform transition-transform ${isArrowDown && selectedStudentId === student.id ? "rotate-180" : ""}`}
                    >
                      ↓
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Student Detail Section */}
        {selectedStudent && (
          <div className="border rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-medium mb-2 text-black">{selectedStudent.name}</h2>
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
                {selectedStudent.assignments.map((assignment, index) => (
                  <tr key={index} className="odd:bg-gray-50 border-b">
                    <td className="px-4 py-2">{assignment.name}</td>
                    <td className="px-4 py-2">{assignment.dueDate}</td>
                    <td className="px-4 py-2">{assignment.submissionDate}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={assignment.score}
                        onChange={(e) => handleScoreChange(selectedStudent.id, index, +e.target.value)}
                        className="w-14 border bg-[#AAFF45] border-black rounded-lg px-2 py-1 text-center"
                      />
                    </td>
                  </tr>
                ))}
                {/* Average Grade and Attendance */}
                <tr className="bg-gray-100 font-medium">
                  <td colSpan={3} className="px-4 py-2 text-right bg-[#AAFF45] border-b-[1px] border-black">Average Grade</td>
                  <td className="px-4 py-2 bg-[#AAFF45] border-b-[1px] border-black">{calculateGrade(selectedStudent.assignments)}</td>
                </tr>
                <tr className="bg-gray-100 font-medium">
                  <td colSpan={3} className="px-4 py-2 text-right bg-[#AAFF45] border-b-[1px] border-black">Attendance (%)</td>
                  <td className="px-4 py-2 border-b-[1px] border-black bg-[#AAFF45]">{selectedStudent.attendance}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
