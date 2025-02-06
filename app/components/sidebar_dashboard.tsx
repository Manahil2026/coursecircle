"use client";

import React from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

// Sidebar Component
const Sidebar_dashboard: React.FC = () => {
  const sidebarItems = [
    { component: <UserButton afterSignOutUrl="/" />, label: "", isLogo: true },
    { icon: "/asset/home_icon.svg", label: "Home", alt: "Home Icon" },
    { icon: "/asset/inbox_icon.svg", label: "Inbox", alt: "Inbox Icon" },
    { icon: "/asset/calendar_icon.svg", label: "Calendar", alt: "Calendar Icon" },
    { icon: "/asset/folder_icon.svg", label: "Files", alt: "Folder Icon" },
    { icon: "/asset/ai_icon.svg", label: "AI Tools", alt: "AI Icon" },
  ];

  return (
    <aside className="fixed top-0 w-16 bg-black text-white flex flex-col items-center justify-start h-full">
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
              {item.isLogo ? (
                item.component
              ) : (
                <>
                  <Image
                    src={item.icon || ""}
                    alt={item.alt || ""}
                    width={27}
                    height={27}
                    priority
                  />
                  {item.label && <span className="text-[10px] py-1">{item.label}</span>}
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar_dashboard;
