"use client";
import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import AdminCoursesPage from "@/app/components/admin_courses";
import AdminUsersPage from "@/app/components/admin_user";
import AdminNavbar from "@/app/components/AdminNavbar";

const AdminDashboard: React.FC = () => {
  const [activePage, setActivePage] = useState("dashboard"); // Track the active page

  const handleNavigation = (page: string) => {
    setActivePage(page); // Update the active page
  };

  return (
    <>
      <Sidebar_dashboard />
      <div className="flex h-full bg-gray-100 flex-1 pl-44">
        {/* Admin Menu Sidebar */}
        <AdminNavbar onNavigate={handleNavigation} />

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {activePage === "dashboard" && (
            <>
              <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
              <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Welcome to CourseCircle Admin</h2>
                <p className="text-gray-600 mb-4">
                  Use the navigation menu on the left to manage courses and users in your educational environment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="font-medium text-lg mb-2">Quick Stats</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Total Courses:</span>
                        <span className="font-medium">20</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Total Students:</span>
                        <span className="font-medium">100</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Total Professors:</span>
                        <span className="font-medium">15</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="font-medium text-lg mb-2">System Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Database: Online</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Authentication: Active</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Storage: 42% Used</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {activePage === "courses" && <AdminCoursesPage />}
          {activePage === "users" && <AdminUsersPage />}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;