import React from "react";

interface CourseCardProps {
  courseName: string;
  assignmentsDue: number;
  notifications: number;
  schedule: string;
  upcomingClassDate: string;
}

const colors = ["bg-pink-200", "bg-blue-200", "bg-green-200", "bg-yellow-200", "bg-purple-200", "bg-red-200"];

const CourseCard: React.FC<CourseCardProps> = ({
  courseName,
  assignmentsDue,
  notifications,
  schedule,
  upcomingClassDate,
}) => {
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div className="flex items-center border rounded-md p-2 shadow-lg bg-gray-200 w-full max-w-xl">
      <div className={`${randomColor} w-24 h-24 flex items-center justify-center text-7xl font-bold rounded-md`}>
        {courseName.charAt(0)}
      </div>
      <div className="ml-4 flex-1">
        <h2 className="text-lg font-medium mt-2">{courseName}</h2>
        <p className="text-gray-600 text-sm">
          You have {assignmentsDue} assignments due and {notifications} pending notifications.
          You have an upcoming class on {upcomingClassDate}.
        </p>
        <div className="mt-3 flex gap-2 text-sm font-semibold">
          <button className="bg-[#AAFF45] px-4 py-1 rounded-lg ">Asgmt {assignmentsDue}</button>
          <button className="bg-[#AAFF45] px-4 py-1 rounded-lg ">Notifs {notifications}</button>
          <button className="bg-[#AAFF45] px-4 py-1 rounded-lg ">{schedule}</button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
