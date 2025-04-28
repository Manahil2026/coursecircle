"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface CourseCardProps {
  courseId: string;
  courseName: string;
  notifications: number;
  schedule: string;
  upcomingClassDate: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  courseId,
  courseName,
  notifications,
  schedule,
  upcomingClassDate,
}) => {
  const router = useRouter();
  const { user } = useUser();
  const [assignmentsDue, setAssignmentsDue] = useState(0);

  // Extract role from Clerk's public metadata
  const role = user?.publicMetadata?.role as "prof" | "member" | undefined;

  useEffect(() => {
    console.log("Inside useEffect - user:", user, "role:", role); // Debugging

    const fetchAssignments = async () => {
      if (!user) {
        console.log("Not fetching assignments: user is missing"); // Debugging
        return;
      }

      // Remove the role !== "member" check to allow fetching for both roles
      try {
        const response = await fetch(`/api/courses/${courseId}/assignments`);
        if (response.ok) {
          const groups = await response.json();
          console.log("Groups fetched:", groups); // Debugging

          let count = 0;
          groups.forEach((group: any) => {
            console.log("Group:", group);
            console.log("Assignments:", group.assignments);

            // For professors, show total assignment count
            // For students/members, only show published assignments
            if (role === "prof") {
              count += group.assignments.length;
            } else {
              count += group.assignments.filter((assignment: any) => assignment.published).length;
            }
          });
          setAssignmentsDue(count);
        }
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [courseId, user, role]);

  const handleClick = () => {
    if (!role) return; // Prevent navigation if role is undefined

    const path =
      role === "prof"
        ? `/pages/professor/course_home/${courseId}`
        : `/pages/student/course_home/${courseId}`;

    router.push(path);
  };

  const handleAssignmentsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!role) return;
    const path = role === "prof"
      ? `/pages/professor/assignments/${courseId}`
      : `/pages/student/assignments/${courseId}`;
    router.push(path);
  };

  const handleNotificationsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!role) return;
    const path = role === "prof"
      ? `/pages/professor/notifications/${courseId}`
      : `/pages/student/notifications/${courseId}`;
    router.push(path);
  };

  return (
    <div
      className="flex items-center border-b rounded-md p-2 shadow-lg border-[#aeaeae85] w-full max-w-xl cursor-pointer transition-all duration-300 hover:transform hover:scale-105"
      onClick={handleClick}
    >
      <div
        style={{
          backgroundColor: `#${((courseName.length * 1234567) % 0xffffff)
            .toString(16)
            .padStart(6, "0")}`,
        }}
        className="w-24 h-24 flex items-center justify-center text-7xl font-bold rounded-md"
      >
        {courseName.charAt(0)}
      </div>
      <div className="ml-4 flex-1">
        <h2 className="text-lg font-medium mt-2">{courseName}</h2>
        <p className="text-gray-700 text-sm">
          You have {assignmentsDue} assignments {role === "prof" ? "created" : "due"} and {notifications} pending
          notifications. You have an upcoming class on {upcomingClassDate}.
        </p>
        <div className="mt-3 flex gap-1 text-sm font-medium">
          <button
            onClick={handleAssignmentsClick}
            className="bg-[#AAFF45] px-3 py-1 rounded-lg hover:bg-[#95e03d] transition-colors"
          >
            Asgmt {assignmentsDue}
          </button>
          {/* <button
            onClick={handleNotificationsClick}
            className="bg-[#AAFF45] px-3 py-1 rounded-lg hover:bg-[#95e03d] transition-colors"
          >
            Notifs {notifications}
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;