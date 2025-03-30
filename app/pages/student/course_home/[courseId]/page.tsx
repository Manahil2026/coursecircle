"use client";
import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";
import { useParams } from "next/navigation";

const Section: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="border border-gray-400 flex flex-col text-sm mb-6 rounded-sm">
    <div className="border-b border-gray-400 p-2 font-medium bg-[#AAFF45] rounded-md]">{title}</div>
    {items.map((item, index) => (
      <div key={index} className="border-b last:border-none border-gray-400 p-2 hover:bg-gray-50 cursor-pointer rounded-sm">
        {item}
      </div>
    ))}
  </div>
);

const Coursepage: React.FC = () => {
  const params = useParams();
  const courseId = params?.courseId as string;
  const [progress, setProgress] = useState(43);
  
  console.log("Course ID in course_home page:", courseId);

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId} />
      <main className="min-h-screen flex-1 p-6 pl-52">
        <h2 className="text-base font-semibold mb-4">Welcome to Your Course</h2>
        <Section title="Course Overview" items={["Get Started", "Syllabus", "Resources"]} />
        <Section title="Course Materials" items={["Lectures", "Assignments", "Quizzes"]} />
      </main>
    </div>
  );
};

export default Coursepage;
