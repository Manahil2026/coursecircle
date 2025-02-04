"use client";

import React from "react";
import Image from "next/image";

// Sidebar Component
const Sidebar: React.FC = () => {
  const sidebarItems = [
    { icon: "/asset/logo_icon.svg", label: "", alt: "Logo Icon", isLogo: true },
    { icon: "/asset/home_icon.svg", label: "Home", alt: "Home Icon" },
    { icon: "/asset/folder_icon.svg", label: "Files", alt: "Folder Icon" },
    { icon: "/asset/calendar_icon.svg", label: "Calendar", alt: "Candar Icon" },
    { icon: "/asset/ai_icon.svg", label: "AI Tools", alt: "AI Icon" },
  ];

  return (
    <aside className="w-16 bg-black text-white flex flex-col items-center justify-start h-screen">
      <nav className="w-full flex flex-col items-center">
        {/* Sidebar Items */}
        <ul className="flex flex-col items-center gap-3 py-1 text-center">
          {sidebarItems.map((item, index) => (
            <li
              key={index}
              className={`w-14 h-14 flex flex-col justify-center items-center ${
                !item.isLogo ? "hover:bg-gray-700" : ""
              } rounded-lg cursor-pointer transition-colors duration-200`}
              role="button"
              aria-label={item.label}
            >
              <Image
                src={item.icon}
                alt={item.alt}
                width={27}
                height={27}
                priority
              />
              {item.label && <span className="text-[10px] py-1">{item.label}</span>}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

// Main Content Component
const MainContent: React.FC = () => {
  return (
    <main className="flex-1 p-6 ">
      <h1 className="text-base font-semibold mb-4">Hi, Joel Boat</h1>
    </main>
  );
};

// StudentDashboard Component
const StudentDashboard: React.FC = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default StudentDashboard;
