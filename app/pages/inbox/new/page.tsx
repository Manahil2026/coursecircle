"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import UserSearchSelect from "@/app/components/messaging/UserSearchSelect";
import ReactQuillEditor from "@/app/components/text_editor";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function NewMessagePage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch courses if the user is a professor
    if (user?.publicMetadata?.role === "prof") {
      const fetchCourses = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/courses/professor");
          if (response.ok) {
            const data = await response.json();
            setCourses(data);
          }
        } catch (err) {
          console.error("Error fetching professor courses:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    }
  }, [user?.publicMetadata?.role]);

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleSendMessage = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one recipient");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSending(true);
    setError("");

    try {
      // First create the conversation
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: selectedUsers.map(user => user.id),
          name: isGroup ? groupName : undefined,
          isGroup,
          courseId: selectedCourse || undefined
        }),
      });

      if (!conversationResponse.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation = await conversationResponse.json();
      
      // Then send the initial message
      const messageResponse = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          isDraft: false
        }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to send message");
      }

      // Navigate to the new conversation
      router.push(`/pages/inbox/${conversation.id}`);
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Sidebar_dashboard />
      <div className="flex h-screen flex-1 pl-16">
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="border-b p-4 flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/pages/inbox")}
                className="mr-4 p-2 rounded-full hover:bg-gray-100"
              >
                <Image src="/asset/back_icon.svg" alt="Back" width={20} height={20} />
              </button>
              <h1 className="text-lg font-medium">New Message</h1>
            </div>
          </div>

          {/* Message Composer */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
              {/* Recipients */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To:
                </label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div key={user.id} className="bg-[#AAFF45] text-black rounded-md px-3 py-1 text-sm flex items-center gap-1">
                      <span>{user.firstName} {user.lastName}</span>
                      <button onClick={() => handleRemoveUser(user.id)} className="ml-1 text-black hover:text-gray-700">
                        <Image src="/asset/close_icon.svg" alt="Remove" width={16} height={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <UserSearchSelect
                  onSelect={handleSelectUser}
                  selectedUsers={selectedUsers}
                  placeholder="Search for recipients..."
                />
              </div>

              {/* Group chat options */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isGroup"
                    checked={isGroup}
                    onChange={(e) => setIsGroup(e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                  <label htmlFor="isGroup" className="ml-2 block text-sm text-gray-700">
                    Create as group conversation
                  </label>
                </div>

                {isGroup && (
                  <div className="mt-2">
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                      Group Name:
                    </label>
                    <input
                      type="text"
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
                      placeholder="Enter group name..."
                    />
                  </div>
                )}
              </div>

              {/* Course selection for contextualized messaging */}
              {courses.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="courseContext" className="block text-sm font-medium text-gray-700 mb-1">
                    Related Course (optional):
                  </label>
                  <select
                    id="courseContext"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
                  >
                    <option value="">None</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Message input */}
              <div className="mb-8"> {/* Increased from mb-4 to mb-8 */}
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message:
                </label>
                <ReactQuillEditor
                  value={message}
                  onChange={setMessage}
                  height="200px"
                />
              </div>

              {/* Empty spacer div */}
              <div className="h-10"></div> {/* Added 40px spacer */}

              {/* Error message */}
              {error && (
                <div className="mb-4 text-red-500 text-sm">{error}</div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2 mt-20"> {/* Added mt-20 for spacing */}
                <button
                  onClick={() => router.push("/pages/inbox")}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending}
                  className={`px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-[#8FE03D] ${
                    sending ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
