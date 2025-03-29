import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { key: "dashboard", label: "Dashboard", path: "dashboard" },
  { key: "courses", label: "Courses", path: "courses" },
  { key: "users", label: "Users", path: "users" },
];

const AdminNavbar: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const pathname = usePathname();

  return (
    <div className="w-32 bg-white shadow-lg border border-[#aeaeae85] h-screen fixed left-16 top-0 pt-3">
      <nav className="flex flex-col">
        {adminLinks.map((link) => (
          <button
            key={link.key}
            onClick={() => onNavigate(link.path)} // Call onNavigate with the page key
            className={`
              px-4 py-1 text-left text-sm 
              ${pathname === link.path 
                ? 'underline' 
                : 'text-black hover:underline'
              }
            `}
          >
            {link.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminNavbar;