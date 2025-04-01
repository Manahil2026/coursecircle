import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface CourseMenuProps {
  courseId: string; // Expecting courseId as a prop
}

const CourseMenu: React.FC<CourseMenuProps> = ({ courseId }) => {
  const router = useRouter();
  const { user } = useUser();

  const role = user?.publicMetadata?.role;

  const menuItems = [
    { name: "Homepage", path: role === "prof" ? `/pages/professor/course_home/${courseId}` : `/pages/student/course_home/${courseId}` },
    { name: "Assignments", path: role === "prof" ? `/pages/professor/assignments/${courseId}` : `/pages/student/assignments/${courseId}` },
    { name: "Gradebook", path: role === "prof" ? `/pages/professor/gradebook/${courseId}` : `/pages/student/gradebook` },
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
