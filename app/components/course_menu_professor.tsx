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
    <div className="w-32 bg-white h-screen fixed left-16 top-0 pt-3 shadow-xl">
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





 
 