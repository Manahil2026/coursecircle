"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface CourseCardProps {
  courseId: string;
  courseName: string;
  assignmentsDue: number;
  notifications: number;
  schedule: string;
  upcomingClassDate: string;
}

const colors = ["bg-pink-300", "bg-blue-300", "bg-green-300", "bg-yellow-300", "bg-purple-300", "bg-red-300"];

const CourseCard: React.FC<CourseCardProps> = ({
  courseId,
  courseName,
  assignmentsDue,
  notifications,
  schedule,
  upcomingClassDate,
}) => {
  const router = useRouter();
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      className="flex items-center border-b rounded-md p-2 shadow-lg border-[#aeaeae85] w-full max-w-xl cursor-pointer transition-all duration-300 hover:transform hover:scale-105"
      onClick={() => router.push(`/pages/professor/course_home/${courseId}`)}
    >
      <div className={`${randomColor} w-24 h-24 flex items-center justify-center text-7xl font-bold rounded-md`}>
        {courseName.charAt(0)}
      </div>
      <div className="ml-4 flex-1">
        <h2 className="text-lg font-medium mt-2">{courseName}</h2>
        <p className="text-gray-700 text-sm">
          You have {assignmentsDue} assignments due and {notifications} pending notifications.
          You have an upcoming class on {upcomingClassDate}.
        </p>
        <div className="mt-3 flex gap-1 text-sm font-medium">
          <button className="bg-[#AAFF45] px-3 py-1 rounded-lg ">Asgmt {assignmentsDue}</button>
          <button className="bg-[#AAFF45] px-3 py-1 rounded-lg ">Notifs {notifications}</button>
          <button className="bg-[#AAFF45] px-3 py-1 rounded-lg ">{schedule}</button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
