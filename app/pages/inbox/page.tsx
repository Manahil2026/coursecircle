"use client";

import { useEffect, useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import Image from "next/image";

interface Email {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
}

const mockEmails: Email[] = [];

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch("/api/emails");
        const data = await response.json();
        setEmails(data);
      } catch (error) {
        console.error("error fetching emails:", error);
      }
    };
    fetchEmails();
  }, []);

  const toggleStar = (id: number) => {
    setEmails(
      emails.map((email) =>
        email.id === id ? { ...email, isStarred: !email.isStarred } : email
      )
    );
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/emails?id=${id}&action=markAsRead`, {
        method: "PUT",
      });
      const updatedEmail = await response.json();
      setEmails((prevEmails) => 
        prevEmails.map((email) => 
          email.id === updatedEmail.id ? updatedEmail : email
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const getInitialColor = (name: string) => {
    const colors = [
      "bg-blue-200",
      "bg-green-200",
      "bg-yellow-200",
      "bg-purple-200",
      "bg-pink-200",
      "bg-indigo-200",
      "bg-red-200",
      "bg-orange-200",
      "bg-teal-200",
      "bg-cyan-200",
      "bg-rose-200",
      "bg-emerald-200",
      "bg-violet-200",
      "bg-amber-200",
      "bg-lime-200",
      "bg-sky-200",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <div className="flex-1 min-h-screen text-black pl-16 bg-gradient-to-t from-[#AAFF45]/15 to-white">
        {/* Navbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/asset/mail.svg"
                alt="Mail icon"
                width={24}
                height={24}
                className="text-black"
              />
              <h1 className="text-xl font-bold">Inbox</h1>
            </div>
            {selectedEmail && (
              <>
                <div className="mx-[105px]"></div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getInitialColor(
                      selectedEmail.sender
                    )}`}
                  >
                    {selectedEmail.sender.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedEmail.sender}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 ml-4">
                  {selectedEmail.time}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-64px)]">
          <div className="flex flex-col md:flex-row h-full">
            {/* Email List */}
            <div className="w-full md:w-1/4 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-full">
                <div className="pl-2 p-3 space-y-1.5">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className={`flex items-center border border-gray-400 rounded-md py-1.5 px-3 
                        w-full cursor-pointer transition-all duration-300 
                        hover:bg-gray-200 hover:shadow-sm bg-white
                        ${
                          selectedEmail?.id === email.id
                            ? "border-black shadow-sm bg-white border-l-4 border-l-black"
                            : "border-gray-500"
                        }`}
                      onClick={() => {
                        setSelectedEmail(email);
                        markAsRead(email.id);
                      }}
                    >
                      {/* Profile Picture */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getInitialColor(
                          email.sender
                        )}`}
                      >
                        {email.sender.charAt(0)}
                      </div>

                      <div className="flex-1 ml-2 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 min-w-0">
                            <span
                              className={`text-sm truncate ${
                                !email.isRead ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {email.sender}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {email.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(email.id);
                              }}
                              className="p-1 rounded-full hover:bg-gray-100 hover:ring-1 hover:ring-gray-300 transition-all"
                            >
                              <Image
                                src="/asset/star.svg"
                                alt="Star"
                                width={14}
                                height={14}
                                className={
                                  email.isStarred
                                    ? "text-black"
                                    : "text-gray-400"
                                }
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add archive functionality
                              }}
                              className="p-1 rounded-full hover:bg-gray-100 hover:ring-1 hover:ring-gray-300 transition-all"
                            >
                              <Image
                                src="/asset/archive.svg"
                                alt="Archive"
                                width={14}
                                height={14}
                                className="text-gray-400"
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add delete functionality
                              }}
                              className="p-1 rounded-full hover:bg-gray-100 hover:ring-1 hover:ring-gray-300 transition-all"
                            >
                              <Image
                                src="/asset/delete_icon.svg"
                                alt="Delete"
                                width={14}
                                height={14}
                                className="text-gray-400"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {email.subject.length > 20
                              ? email.subject.substring(0, 20) + "..."
                              : email.subject}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Preview */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {selectedEmail ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3"></div>
                  </div>
                  <h2 className="text-lg font-bold mb-4">
                    {selectedEmail.subject}
                  </h2>
                  <div className="prose max-w-none mt-6">
                    <p className="text-black text-base leading-relaxed">
                      {selectedEmail.preview}
                    </p>
                    {/* Add more email content here */}
                    <div className="mt-6">
                      <p className="text-black text-base leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris nisi ut aliquip ex ea
                        commodo consequat.
                      </p>
                      <p className="text-black text-base leading-relaxed mt-4">
                        Duis aute irure dolor in reprehenderit in voluptate
                        velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in
                        culpa qui officia deserunt mollit anim id est laborum.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-base">Select an email to view</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
