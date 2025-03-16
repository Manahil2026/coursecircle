// SectionNavLinks.tsx
import React from "react";
import Link from "next/link";

interface NavLink {
  key: string;
  label: string;
  path: string;
}

interface SectionNavLinksProps {
  links: NavLink[];
  activePage: string;
}

const SectionNavLinks: React.FC<SectionNavLinksProps> = ({ links, activePage }) => {
  return (
    <ul className="space-y-2">
      {links.map(link => (
        <li 
          key={link.key}
          className={`p-3 ${
            activePage === link.key ? 
            'bg-black text-white' : 
            'bg-gray-100 hover:bg-gray-300'
          } rounded-md cursor-pointer`}
        >
          <Link href={link.path} className="block w-full h-full">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SectionNavLinks;
