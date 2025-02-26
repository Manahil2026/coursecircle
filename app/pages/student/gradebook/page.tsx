"use client";

import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import { useState } from "react";
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
  const [student, setStudent] = useState<Student>({
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

  const updateScore = (index: number, newScore: number) => {
    setStudent((prevStudent) => {
      const updatedAssignments = [...prevStudent.assignments];
      updatedAssignments[index].score = newScore;
      return { ...prevStudent, assignments: updatedAssignments };
    });
  };

  return (
    <>
      <Sidebar_dashboard />
      <CourseMenu />
      <div className="p-6 max-w-4xl mx-auto rounded-lg">
        <h1 className="text-base font-medium mb-2 text-center text-black">
          Your Grades [ Python Programming ]
        </h1>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-medium mb-2 text-black">
            {student.name}
          </h2>
          <GradeTable
            assignments={student.assignments}
            attendance={student.attendance}
            updateScore={updateScore}
          />
        </div>
      </div>
    </>
  );
}
