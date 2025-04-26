//Student page that lists all assignments for a selected course with submission status for each assignment
"use client";

import React, { useEffect, useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Assignment {
  id: string;
  title: string;
  points: number;
  dueDate: string;
  description?: string;
  published: boolean;
  submissionStatus?: "NOT_SUBMITTED" | "SUBMITTED" | "GRADED";
}

interface Group {
  id: string;
  name: string;
  assignments: Assignment[];
}

const StudentAssignments = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      // Fetch assignments for this course
      fetch(`/api/courses/${courseId}/assignments`)
        .then((res) => res.json())
        .then((data) => {
          // Filter to only show published assignments
          const publishedGroups = data.map((group: Group) => ({
            ...group,
            assignments: group.assignments.filter((assignment: Assignment) => assignment.published)
          })).filter((group: Group) => group.assignments.length > 0); // Only keep groups with assignments
          
          setGroups(publishedGroups);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching assignments:", error);
          setLoading(false);
        });
        
      // Fetch submission statuses
      fetch(`/api/courses/${courseId}/submissions/status`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch submission statuses");
          }
          return res.json();
        })
        .then((data) => {
          // Update groups with submission status
          if (data.statuses) {
            setGroups(prevGroups => {
              const newGroups = JSON.parse(JSON.stringify(prevGroups));
              newGroups.forEach((group: Group) => {
                group.assignments.forEach((assignment: Assignment) => {
                  assignment.submissionStatus = data.statuses[assignment.id] || "NOT_SUBMITTED";
                });
              });
              return newGroups;
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching submission statuses:", error);
        })
        .finally(() => {
          setStatusLoading(false);
        });
    }
  }, [courseId]);

  const handleNavigateToAssignment = (assignmentId: string) => {
    router.push(`/pages/student/view_assignment/${courseId}/${assignmentId}`);
  };

  // Function to format the date in a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "No due date";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Function to format time in 12-hour format
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for AM
    
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Function to get status badge for an assignment
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "GRADED":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Graded
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Submitted
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Not Submitted
          </span>
        );
    }
  };

  return (
    <div className="flex ">
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId} />
      <div className="flex-1 pl-52 px-6 ">
        <div className="py-4">
          <h1 className="text-lg font-medium mb-4">Assignments</h1>

          {loading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
        </div>
          ) : groups.length === 0 ? (
            <p className="text-gray-500 py-4">No assignments available for this course yet.</p>
          ) : (
            <div className="w-full mt-4">
              {groups.length === 0 ? (
              <p>No assignment groups yet.</p>
              ) : (
              groups.map((group) => (
                <div key={group.id} className="mb-6 text-sm">
                <div className="bg-[#AAFF45] border border-gray-400 p-2 rounded-t-sm">
                  <span>{group.name}</span>
                </div>

                {/* Assignments */}
                {(group.assignments || []).map((assignment) => (
                  <div
                  key={assignment.id}
                  className="border border-gray-400 border-t-0 rounded-sm"
                  >
                  <div className="flex justify-between items-center p-2">
                    <div>
                    <p
                      className="text-sm font-semibold text-gray-800 hover:underline cursor-pointer"
                      onClick={() => handleNavigateToAssignment(assignment.id)}
                    >
                      {assignment.title}
                    </p>
                    <div className="text-xs text-gray-600">
                      <b>Due</b>:{" "}
                      {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        })
                      : ""}{" "}
                      at{" "}
                      {assignment.dueDate
                      ? (() => {
                        const dt = new Date(assignment.dueDate);
                        const hh = dt.getHours().toString().padStart(2, "0");
                        const mm = dt.getMinutes().toString().padStart(2, "0");
                        const ampm = parseInt(hh, 10) >= 12 ? "PM" : "AM";
                        const formattedHours = (parseInt(hh, 10) % 12 || 12).toString();
                        return `${formattedHours}:${mm} ${ampm}`;
                        })()
                      : ""}{" "}
                      - {assignment.points} pts
                    </div>
                    </div>
                    {getStatusBadge(assignment.submissionStatus)}
                  </div>
                  </div>
                ))}
                </div>
              ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
