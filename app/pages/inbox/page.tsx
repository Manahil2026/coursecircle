"use client";

import { useState } from "react";
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

const mockEmails: Email[] = [
  {
    id: 1,
    sender: "John Doe",
    subject: "Project Update",
    preview: "Here are the latest updates on the project timeline...",
    time: "10:30 AM",
    isRead: false,
    isStarred: false,
  },
  {
    id: 2,
    sender: "Jane Smith",
    subject: "Meeting Tomorrow",
    preview: "Don't forget about our team meeting tomorrow at 2 PM...",
    time: "9:15 AM",
    isRead: true,
    isStarred: true,
  },
  {
    id: 3,
    sender: "Mike Johnson",
    subject: "New Feature Request",
    preview: "I have a new feature idea for the next sprint...",
    time: "Yesterday",
    isRead: true,
    isStarred: false,
  },
];

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const toggleStar = (id: number) => {
    setEmails(
      emails.map((email) =>
        email.id === id ? { ...email, isStarred: !email.isStarred } : email
      )
    );
  };

  const markAsRead = (id: number) => {
    setEmails(
      emails.map((email) =>
        email.id === id ? { ...email, isRead: true } : email
      )
    );
  };

  const getInitialColor = (name: string) => {
    const colors = [
      'bg-blue-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-purple-200',
      'bg-pink-200',
      'bg-indigo-200'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <div className="flex-1 min-h-screen text-black p-4 pl-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center pl-4">
            <Image
              src="/asset/mail.svg"
              alt="Mail icon"
              width={24}
              height={24}
              className="text-black mr-3"
            />
            <h1 className="text-2xl font-bold">Inbox</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Email List */}
            <div className="md:col-span-3 bg-gray-200 p-3 h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="space-y-1.5">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className={`flex items-center border border-gray-400 rounded-md py-1.5 px-3 
                      w-full cursor-pointer transition-all duration-300 
                      hover:bg-gray-300 hover:shadow-sm bg-white
                      ${selectedEmail?.id === email.id ? 'border-black shadow-sm bg-white' : 'border-gray-500'}`}
                    onClick={() => {
                      setSelectedEmail(email);
                      markAsRead(email.id);
                    }}
                  >
                    {/* Profile Picture */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${getInitialColor(email.sender)}`}>
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
                                email.isStarred ? "text-black" : "text-gray-400"
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
                          {email.subject.length > 20 ? email.subject.substring(0, 20) + '...' : email.subject}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Preview */}
            <div className="md:col-span-9 bg-white border shadow-sm border-black p-4 h-[calc(100vh-6rem)] overflow-y-auto">
              {selectedEmail ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-medium ${getInitialColor(selectedEmail.sender)}`}>
                        {selectedEmail.sender.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">{selectedEmail.sender}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {selectedEmail.time}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-4">
                    {selectedEmail.subject}
                  </h2>
                  <div className="prose max-w-none mt-6">
                    <p className="text-black text-base leading-relaxed">{selectedEmail.preview}</p>
                    {/* Add more email content here */}
                    <div className="mt-6">
                      <p className="text-black text-base leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                      <p className="text-black text-base leading-relaxed mt-4">
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
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
