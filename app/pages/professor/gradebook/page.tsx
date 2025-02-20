"use client";

import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import { useState } from "react";
import Image from "next/image";
import GradeTable from "@/app/components/grade_table";

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
    },
    {
      id: 2,
      name: "Jane Smith",
      assignments: [
        {
          name: "Math Homework",
          dueDate: "2025-01-10",
          submissionDate: "2025-01-12",
          score: 75,
        },
        {
          name: "Science Project",
          dueDate: "2025-01-15",
          submissionDate: "2025-01-16",
          score: 88,
        },
        {
          name: "History Essay",
          dueDate: "2025-01-20",
          submissionDate: "2025-01-20",
          score: 92,
        },
      ],
      attendance: 95,
    },
  ]);

  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [isArrowDown, setIsArrowDown] = useState<boolean>(true);

  const selectStudent = (id: number) => {
    setSelectedStudentId(id === selectedStudentId ? 0 : id);
    setIsArrowDown(!isArrowDown);
  };

  const handleScoreChange = (
    studentId: number,
    assignmentIndex: number,
    newScore: number
  ) => {
    setStudents((prevStudents) => {
      return prevStudents.map((student) => {
        if (student.id === studentId) {
          const updatedAssignments = student.assignments.map(
            (assignment, index) => {
              if (index === assignmentIndex) {
                return { ...assignment, score: newScore };
              }
              return assignment;
            }
          );
          return { ...student, assignments: updatedAssignments };
        }
        return student;
      });
    });
  };

  const selectedStudent = students.find(
    (student) => student.id === selectedStudentId
  );

  return (
    <>
      <Sidebar_dashboard />
      <CourseMenu />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-base font-medium mb-2 text-center text-black">
          Student Grade [ Python Programming ]
        </h1>

        <div className="mb-2 pl-6">
          <ul>
            {students.map((student) => (
              <li key={student.id}>
                <button
                  onClick={() => selectStudent(student.id)}
                  className="w-full text-left p-2 hover:bg-gray-300 transition-colors focus:outline-none border-b-[1px] border-black"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-black">{student.name}</span>
                    <span
                      className={`transform transition-transform ${
                        isArrowDown && selectedStudentId === student.id
                          ? ""
                          : "rotate-180"
                      }`}
                    >
                      <Image
                        src="/asset/arrowdown_icon.svg"
                        alt="Add icon"
                        width={15}
                        height={15}
                        priority
                      />
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {selectedStudent && (
          <div className="border rounded-md p-6">
            <h2 className="text-xl font-medium mb-2 text-black">
              {selectedStudent.name}
            </h2>
            <GradeTable
              assignments={selectedStudent.assignments}
              attendance={selectedStudent.attendance}
              updateScore={(index, newScore) =>
                handleScoreChange(selectedStudent.id, index, newScore)
              }
            />
          </div>
        )}
      </div>
    </>
  );
}
