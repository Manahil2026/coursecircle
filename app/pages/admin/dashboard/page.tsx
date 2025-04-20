"use client";
import React, { useState } from "react";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import CoursesManagement from "@/app/components/admin/courses_management";
import UsersManagement from "@/app/components/admin/users_management";
import DashboardSummary from "@/app/components/admin/dashboard_summary";

const AdminDashboard: React.FC = () => {
  // State to track active section
  const [activeSection, setActiveSection] = useState<"dashboard" | "courses" | "users">("dashboard");

  // Admin sidebar navigation items
  const adminLinks = [
    { 
      key: "dashboard", 
      label: "Dashboard", 
      icon: "/asset/dashboard_icon.svg",
      alt: "Dashboard Icon",
      onClick: () => setActiveSection("dashboard") 
    },
    { 
      key: "courses", 
      label: "Courses", 
      icon: "/asset/courses_icon.svg",
      alt: "Courses Icon",
      onClick: () => setActiveSection("courses") 
    },
    { 
      key: "users", 
      label: "Users", 
      icon: "/asset/users_icon.svg",
      alt: "Users Icon",
      onClick: () => setActiveSection("users") 
    }
  ];

  // Render the appropriate section based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSummary />;
      case "courses":
        return <CoursesManagement />;
      case "users":
        return <UsersManagement />;
      default:
        return <DashboardSummary />;
    }
  };

  return (
    <div className="min-h-screen h-full w-full bg-gradient-to-t from-[#AAFF45]/15 to-white">
      {/* Admin Menu Sidebar */}
      <aside className="fixed top-0 w-16 bg-black text-white flex flex-col items-center justify-start h-screen">
        <nav className="w-full flex flex-col items-center">
          {/* User button at the top */}
          <div className="w-14 h-14 flex flex-col justify-center items-center rounded-lg mb-2 mt-1">
            <UserButton afterSignOutUrl="/" />
          </div>
          
          <ul className="flex flex-col items-center gap-3 py-1 text-center w-full">
            {adminLinks.map((link) => (
              <li
                key={link.key}
                className={`w-14 h-14 flex flex-col justify-center items-center hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200 ${
                  activeSection === link.key ? "bg-gray-700" : ""
                }`}
                role="button"
                aria-label={link.label}
                onClick={link.onClick}
              >
                <Image
                  src={link.icon || ""}
                  alt={link.alt || ""}
                  width={27}
                  height={27}
                  priority
                  className="invert" // Makes the icons white
                  style={{ filter: 'brightness(0) invert(1)', strokeWidth: '2' }} // Alternative approach for stroke
                />
                <span className="text-[10px] py-1 text-white">{link.label}</span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex h-screen w-full flex-1 pl-20">
        <div className="flex-1 pl-6 pt-4">
          <h1 className="text-lg font-medium mb-4">
            Admin {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          
          {/* Dynamic Content Section */}
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;