import React from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
  enrolledCourses?: { id: string; name: string; code: string }[];
  teachingCourses?: { id: string; name: string; code: string }[];
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onSelectUser: (user: User) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, loading, onSelectUser }) => {
  if (loading) {
    return <p className="text-gray-500">Loading users...</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Courses
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 px-6 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectUser(user)}
              >
                <td className="py-2 px-4 whitespace-nowrap">
                  {user.firstName} {user.lastName}
                </td>
                <td className="py-2 px-4 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="py-2 px-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'PROFESSOR' ? 'bg-green-100 text-green-800' : 
                      'bg-blue-100 text-blue-800'}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-2 px-4 whitespace-nowrap">
                  {user.role === 'PROFESSOR' && user.teachingCourses && (
                    <span>{user.teachingCourses.length} teaching</span>
                  )}
                  {user.role === 'STUDENT' && user.enrolledCourses && (
                    <span>{user.enrolledCourses.length} enrolled</span>
                  )}
                  {user.role === 'ADMIN' && (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
