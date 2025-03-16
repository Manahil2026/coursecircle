"use client";
import React, { useState, useEffect } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import SectionNavLinks from "@/app/components/section_nav_links";
import UsersTable from "@/app/components/users_table";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
  enrolledCourses?: { id: string; name: string; code: string }[];
  teachingCourses?: { id: string; name: string; code: string }[];
}

const AdminUsersPage: React.FC = () => {
  // User state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFilter, setUserFilter] = useState<'ALL' | 'STUDENT' | 'PROFESSOR' | 'ADMIN'>('ALL');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin navigation links
  const adminLinks = [
    { key: "dashboard", label: "Dashboard", path: "/pages/admin/dashboard" },
    { key: "courses", label: "Courses", path: "/pages/admin/courses" },
    { key: "users", label: "Users", path: "/pages/admin/users" }
  ];
  
  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users); // Initialize with all users
      } catch (err) {
        setError('Error loading users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users when userFilter changes
  useEffect(() => {
    if (userFilter === 'ALL') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.role === userFilter));
    }
  }, [userFilter, users]);

  return (
    <>
      <Sidebar_dashboard />
      <div className="flex h-full bg-gray-100 flex-1 pl-16">
        {/* Admin Menu Sidebar */}
        <div className="w-64 bg-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
          <SectionNavLinks links={adminLinks} activePage="users" />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold">User Management</h1>
          
          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
            <h2 className="text-xl font-semibold">Users</h2>
            
            {/* User Filter */}
            <div className="mt-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setUserFilter('ALL')}
                  className={`px-4 py-2 rounded-md ${userFilter === 'ALL' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setUserFilter('STUDENT')}
                  className={`px-4 py-2 rounded-md ${userFilter === 'STUDENT' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Students
                </button>
                <button 
                  onClick={() => setUserFilter('PROFESSOR')}
                  className={`px-4 py-2 rounded-md ${userFilter === 'PROFESSOR' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Professors
                </button>
                <button 
                  onClick={() => setUserFilter('ADMIN')}
                  className={`px-4 py-2 rounded-md ${userFilter === 'ADMIN' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Admins
                </button>
              </div>
            </div>
            
            {/* User Table Component */}
            <UsersTable 
              users={filteredUsers} 
              loading={loading} 
              onSelectUser={setSelectedUser} 
            />
            
            {/* Selected User Details */}
            {selectedUser && (
              <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <p className="text-gray-600">{selectedUser.email}</p>
                <p className="text-gray-600">Role: {selectedUser.role}</p>
                
                {selectedUser.role === 'PROFESSOR' && selectedUser.teachingCourses && (
                  <div className="mt-4">
                    <h4 className="font-medium">Teaching Courses</h4>
                    {selectedUser.teachingCourses.length === 0 ? (
                      <p className="text-gray-500">Not teaching any courses</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {selectedUser.teachingCourses.map(course => (
                          <li key={course.id} className="text-sm">
                            {course.code} - {course.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                {selectedUser.role === 'STUDENT' && selectedUser.enrolledCourses && (
                  <div className="mt-4">
                    <h4 className="font-medium">Enrolled Courses</h4>
                    {selectedUser.enrolledCourses.length === 0 ? (
                      <p className="text-gray-500">Not enrolled in any courses</p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {selectedUser.enrolledCourses.map(course => (
                          <li key={course.id} className="text-sm">
                            {course.code} - {course.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUsersPage;
