"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface CourseCardProps {
  courseId: string;
  courseName: string;
  assignmentsDue: number;
  notifications: number;
  schedule: string;
  upcomingClassDate: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  courseId,
  courseName,
  assignmentsDue,
  notifications,
  schedule,
  upcomingClassDate,
}) => {
  const router = useRouter();
  const { user } = useUser();

  // Extract role from Clerk's public metadata
  const role = user?.publicMetadata?.role as "prof" | "member" | undefined;

  const handleClick = () => {
    if (!role) return; // Prevent navigation if role is undefined

    const path =
      role === "prof"
        ? `/pages/professor/course_home/${courseId}`
        : `/pages/student/course_home/${courseId}`;

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
          You have {assignmentsDue} assignments due and {notifications} pending
          notifications. You have an upcoming class on {upcomingClassDate}.
        </p>
        <div className="mt-3 flex gap-1 text-sm font-medium">
          <button className="bg-[#AAFF45] px-3 py-1 rounded-lg ">
            Asgmt {assignmentsDue}
          </button>
          <button className="bg-[#AAFF45] px-3 py-1 rounded-lg ">
            Notifs {notifications}
          </button>
          <button className="bg-[#AAFF45] px-3 py-1 rounded-lg ">
            {schedule}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
