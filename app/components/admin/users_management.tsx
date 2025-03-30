import React, { useState, useEffect } from "react";
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

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFilter, setUserFilter] = useState<'ALL' | 'STUDENT' | 'PROFESSOR' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Failed to fetch users');
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
    <div className="mt-2">
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

{selectedUser && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50 shadow-md max-w-md max-h-64 overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-semibold truncate">
          {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <button
          onClick={() => setSelectedUser(null)}
          className="text-gray-500 hover:text-gray-700 text-sm"
              >
          Close
              </button>
            </div>
            <p className="text-gray-600 text-sm truncate">{selectedUser.email}</p>
            <p className="text-gray-600 text-sm">Role: {selectedUser.role}</p>

            {selectedUser.role === 'PROFESSOR' && selectedUser.teachingCourses && (
              <div className="mt-3">
          <h4 className="font-medium text-sm">Teaching Courses</h4>
          {selectedUser.teachingCourses.length === 0 ? (
            <p className="text-gray-500 text-xs">Not teaching any courses</p>
          ) : (
            <ul className="mt-1 space-y-1">
              {selectedUser.teachingCourses.map(course => (
                <li key={course.id} className="text-xs truncate">
            {course.code} - {course.name}
                </li>
              ))}
            </ul>
          )}
              </div>
            )}

            {selectedUser.role === 'STUDENT' && selectedUser.enrolledCourses && (
              <div className="mt-3">
          <h4 className="font-medium text-sm">Enrolled Courses</h4>
          {selectedUser.enrolledCourses.length === 0 ? (
            <p className="text-gray-500 text-xs">Not enrolled in any courses</p>
          ) : (
            <ul className="mt-1 space-y-1">
              {selectedUser.enrolledCourses.map(course => (
                <li key={course.id} className="text-xs truncate">
            {course.code} - {course.name}
                </li>
              ))}
            </ul>
          )}
              </div>
            )}
          </div>
        )}

      <div className="p-4">
        <div className="mt-4 mb-6 relative">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-auto px-4 py-2 pl-10 border rounded border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
          <img
            src="/asset/search_icon.svg"
            alt="Search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
          />
        </div>


        <div className="mt-4 mb-6">
          <div className="flex space-x-2">
            {['ALL', 'STUDENT', 'PROFESSOR', 'ADMIN'].map(role => (
              <button
                key={role}
                onClick={() => setUserFilter(role as 'ALL' | 'STUDENT' | 'PROFESSOR' | 'ADMIN')}
                className={`px-4 py-2 ${
                  userFilter === role ? 'border-b-2 text-black border-black' : 'hover:border-b-2 border-black'
                }`}
              >
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
            <div className="flex flex-col items-center space-y-2">
            <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
            </div>
        ) : (
          <div className="overflow-y-auto max-h-72">
            <UsersTable users={filteredUsers} loading={loading} onSelectUser={setSelectedUser} />
          </div>
        )}


      </div>
    </div>
  );
};

export default UsersManagement;
