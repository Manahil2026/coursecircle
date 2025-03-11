"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const CourseMenu: React.FC = () => { // Use this later when ready: const CourseMenu: React.FC<{ courseId: string }> = ({ courseId }) => {

  const router = useRouter();
  const { user } = useUser();

  // Determine role 
  const role = user?.publicMetadata?.role; 

  // Define menu items with dynamic paths based on role
  const menuItems = [
    { name: "Homepage", path: role === "prof" ? `/pages/professor/course_home` : `/pages/student/course_home/`}, // use ${courseId} for dynamic path later
    { name: "Assignments", path: role === "prof" ? "/pages/professor/assignments" : "/pages/student/assignments" },
    { name: "Gradebook", path: role === "prof" ? "/pages/professor/gradebook" : "/pages/student/gradebook" },
  ];

  return (
    <div className="w-32 bg-white shadow-lg border border-[#aeaeae85] h-screen fixed left-16 top-0 pt-3">
      <nav className="flex flex-col">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="px-4 py-1 text-left text-black text-sm hover:underline"
          >
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CourseMenu;
