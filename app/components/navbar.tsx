import React from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 text-base gap-6">
      {/* Logo or toggle button */}
      <div className="flex items-center">
        <div className="w-6 h-6 bg-black rounded-full"></div>
      </div>

      {/* Navigation links */}
      <div className="hidden md:flex space-x-8 text-gray-800 ">
        <Link href="#about-us" className="hover:text-black">
          About us
        </Link>
        <Link href="#products" className="hover:text-black">
          Products
        </Link>
        <Link href="#solutions" className="hover:text-black">
          Solutions
        </Link>
        <Link href="#contact" className="hover:text-black">
          Contact
        </Link>
      </div>

      {/* Login/Signup button */}
      <div>
        <button className="px-4 py-2 border border-gray-800 rounded-md hover:bg-gray-100">
          Login/Signup
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
