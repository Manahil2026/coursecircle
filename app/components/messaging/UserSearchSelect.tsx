import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  courseRelation?: 'PROFESSOR' | 'STUDENT' | null;
}

interface UserSearchSelectProps {
  onSelect: (user: User) => void;
  selectedUsers: User[];
  courseId?: string;
  role?: string;
  placeholder?: string;
}

const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  onSelect,
  selectedUsers,
  courseId,
  role,
  placeholder = "Search users..."
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchUsers(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, courseId, role]);

  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Updated URL to use the existing search endpoint
      let url = `/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`;
      if (courseId) url += `&courseId=${encodeURIComponent(courseId)}`;
      if (role) url += `&role=${encodeURIComponent(role)}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to search users");
      }
      
      const users = await response.json();
      
      // Filter out already selected users
      const filteredResults = users.filter(
        (user: User) => !selectedUsers.some(selected => selected.id === user.id)
      );
      
      setResults(filteredResults);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user: User) => {
    onSelect(user);
    setQuery("");
    setResults([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Helper function to get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'PROFESSOR':
        return 'bg-green-100 text-green-800';
      case 'STUDENT':
        return 'bg-blue-100 text-blue-800';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          className="w-full p-2 border rounded-md focus:ring-1 focus:ring-[#AAFF45] focus:outline-none"
        />
        {loading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-t-[#AAFF45] border-r-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {focused && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border max-h-60 overflow-y-auto">
          {results.map(user => (
            <div
              key={user.id}
              onClick={() => handleSelect(user)}
              className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>
          ))}
        </div>
      )}

      {focused && query && results.length === 0 && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border p-2 text-gray-500 text-center">
          No users found
        </div>
      )}
    </div>
  );
};

export default UserSearchSelect;
