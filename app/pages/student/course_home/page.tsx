"use client";
import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";

const Section: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="border border-gray-400 flex flex-col text-sm mb-6 rounded-sm">
    <div className="border-b border-gray-400 p-2 font-medium bg-[#AAFF45]">{title}</div>
    {items.map((item, index) => (
      <div key={index} className="border-b last:border-none border-gray-400 p-2 hover:bg-gray-50 cursor-pointer">
        {item}
      </div>
    ))}
  </div>
);

const Coursepage: React.FC = () => {
  const [progress, setProgress] = useState(43);

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu />
      <main className="min-h-screen flex-1 p-6 pl-52">
        <h2 className="text-base font-semibold mb-4">Welcome to Your Course</h2>
        <Section title="Course Overview" items={["Get Started", "Syllabus", "Resources"]} />
        <Section title="Course Materials" items={["Lectures", "Assignments", "Quizzes"]} />
      </main>
    </div>
  );
};

export default Coursepage;
