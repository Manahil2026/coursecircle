// app/pages/admin/dashboard/page.tsx
"use client";
import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CoursesManagement from "@/app/components/admin/courses_management";
import UsersManagement from "@/app/components/admin/users_management";
import DashboardSummary from "@/app/components/admin/dashboard_summary";

const AdminDashboard: React.FC = () => {
  // State to track active section
  const [activeSection, setActiveSection] = useState<"dashboard" | "courses" | "users">("dashboard");

  const adminLinks = [
    { key: "dashboard", label: "Dashboard", onClick: () => setActiveSection("dashboard") },
    { key: "courses", label: "Courses", onClick: () => setActiveSection("courses") },
    { key: "users", label: "Users", onClick: () => setActiveSection("users") }
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
    <>
      <Sidebar_dashboard />
      <div className="flex h-full bg-gray-100 flex-1 pl-44">
        {/* Admin Menu Sidebar */}
        <div className="w-32 bg-white shadow-lg border border-[#aeaeae85] h-screen fixed left-16 top-0 pt-3">
          <nav>
            <nav className="flex flex-col">
              {adminLinks.map((link) => (
                  <button
                    key={link.key}
                    onClick={link.onClick}
                    className={`px-4 py-1 text-left text-black text-sm hover:underline ${
                      activeSection === link.key
                        ? "underline"
                        : "hover:underline"
                    }`}
                  >
                    {link.label}
                  </button>
              ))}
            </nav>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 pl-6 pt-4">
          <h1 className="text-lg font-medium mb-6">
            Admin {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          
          {/* Dynamic Content Section */}
          {renderSection()}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;