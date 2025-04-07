import React, { useState } from "react";

interface Person {
  name: string;
  email: string;
  role: string;
}

interface PeopleTableProps {
  people: Person[];
}

const PeopleTable: React.FC<PeopleTableProps> = ({ people }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  // Filter people based on search query and selected role
  const filteredPeople = people.filter((person) => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "All" || person.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4 mb-6 justify-between">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search people"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-10 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm6-2l4 4"
              />
            </svg>
          </span>
        </div>

        {/* Role Filter Dropdown */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="PROFESSOR">Professor</option>
        </select>
      </div>

      {/* People Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-6 py-3 text-left text-sm font-medium text-gray-700">
                Name
              </th>
              <th className="border border-gray-300 px-6 py-3 text-left text-sm font-medium text-gray-700">
                Email
              </th>
              <th className="border border-gray-300 px-6 py-3 text-left text-sm font-medium text-gray-700">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPeople.map((person, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
              >
                <td className="border border-gray-300 px-6 py-4 text-sm text-gray-700">
                  {person.name}
                </td>
                <td className="border border-gray-300 px-6 py-4 text-sm text-gray-700">
                  {person.email}
                </td>
                <td className="border border-gray-300 px-6 py-4 text-sm text-gray-700">
                  {person.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results Message */}
      {filteredPeople.length === 0 && (
        <p className="text-gray-500 mt-4 text-center">No people found matching your criteria.</p>
      )}
    </div>
  );
};

export default PeopleTable;