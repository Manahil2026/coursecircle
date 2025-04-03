"use client";

import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StudentGradeTable from "@/app/components/student_grade_table";

interface Assignment {
  id: string;
  name: string;
  dueDate: string;
  points: number;
  grade: number | null;
  submissionDate?: string;
  feedback?: string | null;
}

export default function GradeTracker() {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courseName, setCourseName] = useState<string>("Your Course");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchGradeData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details to get the name
        try {
          const courseResponse = await fetch(`/api/courses/${courseId}`);
          if (courseResponse.ok) {
            const courseData = await courseResponse.json();
            setCourseName(courseData.name);
          }
        } catch (err) {
          console.error("Error fetching course details:", err);
          // Continue anyway - course name is not critical
        }
        
        // Fetch assignments for this course
        const assignmentsResponse = await fetch(`/api/courses/${courseId}/assignments`);
        if (!assignmentsResponse.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const assignmentsData = await assignmentsResponse.json();
        
        // Get all published assignments from all groups
        const publishedAssignments = assignmentsData
          .flatMap((group: any) => 
            group.assignments.filter((assignment: any) => assignment.published)
          );

        // Fetch submission data for each assignment
        const assignmentsWithGrades = await Promise.all(
          publishedAssignments.map(async (assignment: any) => {
            try {
              const gradeResponse = await fetch(`/api/courses/${courseId}/assignments/${assignment.id}/grade`);
              
              if (gradeResponse.ok) {
                const gradeData = await gradeResponse.json();
                
                return {
                  id: assignment.id,
                  name: assignment.title,
                  dueDate: assignment.dueDate,
                  points: assignment.points,
                  grade: gradeData.pointsEarned,
                  submissionDate: gradeData.submissionDate,
                  feedback: gradeData.feedback
                };
              } else {
                return {
                  id: assignment.id,
                  name: assignment.title,
                  dueDate: assignment.dueDate,
                  points: assignment.points,
                  grade: null
                };
              }
            } catch (error) {
              console.error(`Error fetching grade for assignment ${assignment.id}:`, error);
              return {
                id: assignment.id,
                name: assignment.title,
                dueDate: assignment.dueDate,
                points: assignment.points,
                grade: null
              };
            }
          })
        );

        setAssignments(assignmentsWithGrades);
      } catch (err) {
        console.error("Error fetching grade data:", err);
        setError(err instanceof Error ? err.message : "Failed to load grade data");
      } finally {
        setLoading(false);
      }
    };

    fetchGradeData();
  }, [courseId]);

  return (
    <>
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId as string} />
      <div className="p-6 max-w-4xl mx-auto rounded-lg pl-52">
        <h1 className="text-xl font-medium mb-4 text-center text-black">
          Your Grades [ {courseName} ]
        </h1>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="w-8 h-8 border-4 border-t-[#AAFF45] border-[#d1e3bb] rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
            {error}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center text-gray-500 my-8">
            No graded assignments available for this course yet.
          </div>
        ) : (
          <div className="border rounded-lg p-6 bg-white shadow-md">
            <StudentGradeTable assignments={assignments} attendance={95} />
          </div>
        )}
      </div>
    </>
  );
}
