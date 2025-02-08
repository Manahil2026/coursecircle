"use client";
import React from "react";
import { useRouter } from "next/navigation";

const CourseMenu: React.FC = () => {
  const router = useRouter();

  const menuItems = [
    { name: "Homepage", path: "/pages/professor/course_home" },
    { name: "Assignments", path: "/pages/professor/assignments" },
    { name: "Gradebook", path: "/pages/professor/gradebook" },
  ];

  return (
    <div className="w-64 bg-gray-200 h-screen fixed left-16 top-0 pt-16">
      <nav className="flex flex-col">
        {menuItems.map((item) => (
          <button 
            key={item.path} 
            onClick={() => router.push(item.path)}
            className="px-6 py-3 text-left text-black hover:bg-gray-300"
          >
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CourseMenu;





 
 