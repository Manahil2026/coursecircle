"use client";

import { useParams } from "next/navigation";
import CourseMenu from "@/app/components/course_menu";
import SidebarDashboard from "@/app/components/sidebar_dashboard";
import GradeTable from "@/app/components/grade_table";
import { useEffect, useState } from "react";

interface Assignment {
  id: number;
  dueDate: string;
  name: string;
  score: number | null;
  points: number;
  graded: boolean;
}

interface Student {
  id: number;
  name: string;
  assignments: Assignment[];
  average: number | string;
}

interface GradeChange {
  studentId: number;
  assignmentId: number;
  newScore: number | null;
  graded: boolean;
}

export default function GradeTracker() {
  const { courseId } = useParams();

  // State for the table’s current view
  const [students, setStudents] = useState<Student[]>([]);
  // A snapshot we can revert to on “Cancel”
  const [originalStudentsSnapshot, setOriginalStudentsSnapshot] = useState<Student[]>([]);
  // All assignments (for header columns)
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track only the edits the user has made
  const [pendingChanges, setPendingChanges] = useState<GradeChange[]>([]);


    const fetchGradebookData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/gradebook?courseId=${courseId}`);
        const data = await response.json();

        const fetchedAssignments = data.assignments || [];

        const loadedStudents: Student[] = data.gradebook.map(
          (gradebookEntry: any) => {
            const studentRecord = data.students.find(
              (record: any) => record.id === gradebookEntry.studentId
            );

            const studentAssignments: Assignment[] = fetchedAssignments.map(
              (assignmentData: any) => {
                const submissionRecord = studentRecord.submissions.find(
                  (submission: any) =>
                    submission.assignment.groupId === assignmentData.groupId &&
                    submission.assignment.id === assignmentData.id
                );
                return {
                  id: assignmentData.id,
                  name: assignmentData.title,
                  dueDate: assignmentData.dueDate,
                  score: submissionRecord?.grade ?? null,
                  points: assignmentData.points,
                  graded: submissionRecord?.grade != null,
                };
              }
            );

            return {
              id: gradebookEntry.studentId,
              name: gradebookEntry.name,
              assignments: studentAssignments,
              average: gradebookEntry.weightedGrade,
            };
          }
        );

        setStudents(loadedStudents);
        setOriginalStudentsSnapshot(loadedStudents);
        setAllAssignments(fetchedAssignments);
      } catch (error) {
        console.error("Error fetching gradebook data:", error);
        setError("Failed to fetch gradebook data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
  useEffect(() => {
      if (!courseId) return;

    fetchGradebookData();
  }, [courseId]);

  // Called by GradeTable whenever a cell is edited or toggled
  const handleCellEdit = (
    studentId: number,
    assignmentId: number,
    newScore: number | null,
    graded: boolean
  ) => {
    setStudents((previousStudents) =>
      previousStudents.map((student) => {
        if (student.id !== studentId) return student; // Match by student.id
        const updatedAssignments = student.assignments.map((assignment) =>
          assignment.id === assignmentId // Match by assignment.id
            ? { ...assignment, score: graded ? newScore : null, graded }
            : assignment
        );
        return { ...student, assignments: updatedAssignments };
      })
    );

    // Record or overwrite this single-cell change
    const studentUniqueId = studentId; // Use the passed studentId directly
    const assignmentUniqueId = assignmentId; // Use the passed assignmentId directly
    setPendingChanges((currentChanges) => {
      // Remove any old entry for this same cell
      const filteredChanges = currentChanges.filter(
        (change) =>
          !(
            change.studentId === studentUniqueId &&
            change.assignmentId === assignmentUniqueId
          )
      );
      return [
        ...filteredChanges,
        { studentId: studentUniqueId, assignmentId: assignmentUniqueId, newScore, graded },
      ];
    });
  };

  // Send all pendingChanges to the API in one go
  const saveAllChanges = async () => {
    if (pendingChanges.length === 0) return;
    try {
      await Promise.all(
        pendingChanges.map((pendingChange) =>
          fetch("/api/gradebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: pendingChange.studentId,
              assignmentId: pendingChange.assignmentId,
              newGrade: pendingChange.graded
                ? pendingChange.newScore
                : null,
              graded: pendingChange.graded,
            }),
          })
        )
      );
      // On success, reset our “original” snapshot & clear the queue
      setOriginalStudentsSnapshot(students);
      setPendingChanges([]);
      alert("All changes saved successfully!");
      // On success, refetch the updated data
      await fetchGradebookData();
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("Error saving changes. Please try again.");
    }
  };

  // Revert back to the snapshot
  const cancelAllChanges = () => {
    setStudents(originalStudentsSnapshot);
    setPendingChanges([]);
  };

  return (
    <>
      <SidebarDashboard />
      <CourseMenu courseId={courseId as string} />
      <div className="p-6 max-w-4xl mx-auto rounded-lg pl-52">
        <h1 className="text-base font-medium mb-6 text-center text-black">
          Gradebook
        </h1>

        {isLoading ? (
          <div className="h-screen flex items-center justify-center bg-white">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
            {error}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            No students enrolled in this course yet.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <GradeTable
              students={students}
              assignments={allAssignments}
              updateScore={handleCellEdit}
            />

            <div className="p-4 flex space-x-2 border-t border-gray-200">
              <button
                onClick={saveAllChanges}
                disabled={pendingChanges.length === 0}
                className="px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#94db3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                onClick={cancelAllChanges}
                disabled={pendingChanges.length === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
