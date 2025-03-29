"use client";
import React, { useState, useEffect } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import UsersTable from "@/app/components/users_table";
import AdminNavbar from "@/app/components/AdminNavbar";

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
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFilter, setUserFilter] = useState<'ALL' | 'STUDENT' | 'PROFESSOR' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const adminLinks = [
    { key: "dashboard", label: "Dashboard", path: "/pages/admin/dashboard" },
    { key: "courses", label: "Courses", path: "/pages/admin/courses" },
    { key: "users", label: "Users", path: "/pages/admin/users" }
  ];

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
        setFilteredUsers(data.users);
      } catch (err) {
        setError('Error loading users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    if (userFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === userFilter);
    }
    if (searchQuery) {
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  }, [userFilter, searchQuery, users]);

  return (
    <>

      <div className="flex h-full bg-gray-100 flex-1 pl-44">

        <div className="flex-1 p-8">
          <h1 className="text-xl font-medium">User Management</h1>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          <div className="mt-4 p-4 bg-white shadow-sm rounded-md border">
            <h2 className="text-lg font-semibold">Users</h2>
            <div className="mt-2 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex space-x-1">
                {['ALL', 'STUDENT', 'PROFESSOR', 'ADMIN'].map(role => (
                  <button
                    key={role}
                    onClick={() => setUserFilter(role as 'ALL' | 'STUDENT' | 'PROFESSOR' | 'ADMIN')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      userFilter === role ? 'bg-[#AAFF45] text-black' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="mt-2 sm:mt-0 px-3 py-1 border rounded-md text-sm w-full sm:w-48"
              />
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <div className="loader border-t-4 border-blue-500 rounded-full w-6 h-6 animate-spin"></div>
              </div>
            ) : (
              <UsersTable users={filteredUsers} loading={loading} onSelectUser={setSelectedUser} />
            )}
            {selectedUser && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Close
                  </button>
                </div>
                <p className="text-gray-600 text-sm">{selectedUser.email}</p>
                <p className="text-gray-600 text-sm">Role: {selectedUser.role}</p>
                {selectedUser.role === 'PROFESSOR' && selectedUser.teachingCourses && (
                  <div className="mt-2">
                    <h4 className="font-medium text-sm">Teaching Courses</h4>
                    {selectedUser.teachingCourses.length === 0 ? (
                      <p className="text-gray-500 text-sm">Not teaching any courses</p>
                    ) : (
                      <ul className="mt-1 space-y-1">
                        {selectedUser.teachingCourses.map(course => (
                          <li key={course.id} className="text-xs">
                            {course.code} - {course.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {selectedUser?.role === 'STUDENT' && selectedUser.enrolledCourses && (
                  <div className="mt-2">
                    <h4 className="font-medium text-sm">Enrolled Courses</h4>
                    {selectedUser?.enrolledCourses.length === 0 ? (
                      <p className="text-gray-500 text-sm">Not enrolled in any courses</p>
                    ) : (
                      <ul className="mt-1 space-y-1">
                        {selectedUser?.enrolledCourses.map(course => (
                          <li key={course.id} className="text-xs">
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
