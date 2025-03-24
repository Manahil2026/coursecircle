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

  useEffect(() => {
    if (courseId) {
      // Fetch assignments for this course
      fetch(`/api/courses/${courseId}/assignments`)
        .then((res) => res.json())
        .then((data) => {
          setGroups(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching assignments:", error);
          setLoading(false);
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

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId} />
      <div className="flex-1 pl-52 px-6">
        <div className="py-4">
          <h1 className="text-lg font-medium mb-4">Assignments</h1>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-t-[#AAFF45] border-[#d1e3bb] rounded-full animate-spin"></div>
            </div>
          ) : groups.length === 0 ? (
            <p className="text-gray-500 py-4">No assignments available for this course yet.</p>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group.id} className="border border-gray-300 rounded-md overflow-hidden">
                  <div className="bg-[#B9FF66] p-3 font-medium">{group.name}</div>
                  
                  {group.assignments.length === 0 ? (
                    <p className="p-4 text-gray-500">No assignments in this group yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {group.assignments.map((assignment) => (
                        <div 
                          key={assignment.id} 
                          className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleNavigateToAssignment(assignment.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{assignment.title}</h3>
                              <div className="text-sm text-gray-600 mt-1">
                                Due: {formatDate(assignment.dueDate)} at {formatTime(assignment.dueDate)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Points: {assignment.points}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                Not Submitted
                              </span>
                              <Image 
                                src="/asset/arrowdown_icon.svg" 
                                alt="View assignment" 
                                width={16} 
                                height={16} 
                                className="transform rotate-270"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignments;
