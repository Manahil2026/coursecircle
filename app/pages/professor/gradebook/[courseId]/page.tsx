"use client";

import { useParams } from "next/navigation";
import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import GradeTable from "@/app/components/grade_table";
import { useEffect, useState } from "react";

interface Assignment {
  id: number;
  dueDate: string;
  name: string;
  score: number|null;
  points: number;
  graded: boolean;
}

interface Student {
  id: number;
  name: string;
  assignments: Assignment[];
  attendance: number;
}

export default function GradeTracker() {
  const {courseId} = useParams();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return; // Wait until courseId is available

    const fetchGradebookData = async () => {
      try {
        const response = await fetch(`/api/gradebook?courseId=${courseId}`);
        const data = await response.json();

        const allAssignments = data.assignments; // Ensure this is populated
        if (!allAssignments) {
          console.error("allAssignments is undefined");
          return;
        }

        const formattedStudents = data.students.map((student: any) => {
          const assignments = allAssignments.map((assignment: any) => {
            const submission = student.submissions.find(
              (sub: any) => sub.assignment.title === assignment.title
            );

            return {
              id: assignment.id,
              name: assignment.title,
              dueDate: assignment.dueDate,
              score: submission?.grade ?? null,
              points: assignment.points,
              graded: submission?.grade !== null,
            };
          }) || [];

          return {
            id: student.id,
            name: `${student.firstName} ${student.lastName}`,
            assignments,
            attendance: 100, // Replace with actual attendance data if available
          };
        });

        setStudents(formattedStudents);
      } catch (error) {
        console.error("Error fetching gradebook data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGradebookData();
  }, [courseId]); // Re-run the effect when courseId changes

  const handleScoreChange = async (
    studentId: number,
    assignmentIndex: number,
    newScore: number | null,
    graded: boolean
  ) => {
    // Update the frontend state
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === studentId) {
          const updatedAssignments = student.assignments.map((assignment, index) => {
            if (index === assignmentIndex) {
              return { ...assignment, score: newScore, graded };
            }
            return assignment;
          });
          return { ...student, assignments: updatedAssignments };
        }
        return student;
      })
    );

    // Send the updated grade and graded state to the backend
    try {
      const assignmentId = students
        .find((student) => student.id === studentId)
        ?.assignments[assignmentIndex]?.id;

      const response = await fetch("/api/gradebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          assignmentId,
          newGrade: graded ? newScore : null, // Send null if ungraded
          graded,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update grade in the database");
      }
    } catch (error) {
      console.error("Error updating grade:", error);
    }
  };

  const updateScore = (
    studentIndex: number,
    assignmentIndex: number,
    newScore: number | null,
    graded: boolean = true
  ) => {
    setStudents((prevStudents) =>
      prevStudents.map((student, sIndex) => {
        if (sIndex === studentIndex) {
          const updatedAssignments = student.assignments.map((assignment, aIndex) => {
            if (aIndex === assignmentIndex) {
              return {
                ...assignment,
                score: graded ? newScore : null, // Set score to null if ungraded
                graded, // Update the graded status
              };
            }
            return assignment;
          });
          return { ...student, assignments: updatedAssignments };
        }
        return student;
      })
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId as string} /> {/* Pass courseId to CourseMenu */}
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-base font-medium mb-4 text-center text-black">
          Gradebook
        </h1>
        <GradeTable
          students={students}
          updateScore={(studentIndex, assignmentIndex, newScore, graded) =>
            handleScoreChange(students[studentIndex].id, assignmentIndex, newScore, graded)
          }
        />
      </div>
    </>
  );
}
