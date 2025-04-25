"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

// Sidebar Component
const Sidebar_dashboard: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;

  // Function to handle home click based on user role
  const handleHomeClick = () => {
    if (userRole === "member") {
      router.push("/pages/student/dashboard");
    } else if (userRole === "prof") {
      router.push("/pages/professor/dashboard");
    }
  };

  const sidebarItems = [
    {
      component: <UserButton afterSignOutUrl="/" />,
      label: "",
      isLogo: true,
      path: "",
    },
    {
      icon: "/asset/home_icon.svg",
      label: "Home",
      alt: "Home Icon",
      onClick: handleHomeClick,
      path:
        userRole === "member"
          ? "/pages/student/dashboard"
          : userRole === "prof"
          ? "/pages/professor/dashboard"
          : "",
    },
    {
      icon: "/asset/inbox_icon.svg",
      label: "Inbox",
      alt: "Inbox Icon",
      onClick: () => router.push("/pages/inbox"),
      path: "/pages/inbox",
    },
    {
      icon: "/asset/calendar_icon.svg",
      label: "Calendar",
      alt: "Calendar Icon",
      path: "/pages/calendar",
      onClick: () => router.push("/pages/calendar"),
    },

    {
      icon: "/asset/ai_icon.svg",
      label: "AI Tools",
      alt: "AI Icon",
      onClick: () => router.push("/pages/chat"),
      path: "/pages/chat",
    },
  ];

  // Function to check if the item is active
  const isActive = (itemPath: string) => {
    if (!itemPath) return false;
    return pathname?.includes(itemPath);
  };

  return (
    <aside className="fixed top-0 w-16 bg-black text-white flex flex-col items-center justify-start h-full">
      <nav className="w-full flex flex-col items-center">
        {/* Sidebar Items */}
        <ul className="flex flex-col items-center gap-[17px] py-1 text-center">
          {sidebarItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <li
                key={index}
                className={`w-14 h-14 flex flex-col justify-center items-center ${
                  !item.isLogo ? "hover:bg-gray-700" : ""
                } ${
                  active && !item.isLogo ? "bg-gray-700 relative" : ""
                } rounded-lg cursor-pointer transition-colors duration-200`}
                role="button"
                aria-label={item.label}
                onClick={item.onClick}
              >
                {item.isLogo ? (
                  item.component
                ) : (
                  <>
                    <Image
                      src={item.icon || ""}
                      alt={item.alt || ""}
                      width={27}
                      height={27}
                      priority
                    />
                    {item.label && (
                      <span className="text-[10px] py-1">{item.label}</span>
                    )}
                    {active && (
                      <div className=""></div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar_dashboard;
