"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import ReactQuillEditor from "@/app/components/text_editor";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

export default function AnnouncementPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courseInfo, setCourseInfo] = useState<{ id: string; name: string; code: string } | null>(null);
  const [message, setMessage] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // Check if user is a professor
  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role !== "prof") {
      router.push("/pages/inbox");
    }
  }, [isLoaded, user, router]);

  // Fetch courses when the component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/courses/professor");
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          setError("Failed to fetch courses");
        }
      } catch (err) {
        console.error("Error fetching professor courses:", err);
        setError("An error occurred while fetching courses");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user?.publicMetadata?.role === "prof") {
      fetchCourses();
    }
  }, [isLoaded, user]);

  // Update course info when course changes
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        setCourseInfo(course);
      }
    } else {
      setCourseInfo(null);
    }
  }, [selectedCourse, courses]);

  // Fetch students when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      fetch(`/api/courses/${selectedCourse}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch course");
          return res.json();
        })
        .then(data => {
          if (data.students && Array.isArray(data.students)) {
            setStudents(data.students);
          } else {
            setStudents([]);
          }
        })
        .catch(err => {
          console.error("Error fetching students:", err);
          setError("Failed to load students. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  }, [selectedCourse]);

  const handleSendAnnouncement = async () => {
    if (!selectedCourse) {
      setError("Please select a course");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    if (students.length === 0) {
      setError("No students found in this course");
      return;
    }

    setSending(true);
    setError("");

    try {
      // Create the conversation with all students
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: students.map(student => student.id),
          name: `${courseInfo?.code} Announcement`,
          isGroup: true,
          isAnnouncement: true, 
          courseId: selectedCourse
        }),
      });

      if (!conversationResponse.ok) {
        throw new Error("Failed to create announcement");
      }

      const conversation = await conversationResponse.json();
      
      // Send the announcement message
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
        throw new Error("Failed to send announcement");
      }

      // Navigate to the conversation
      router.push(`/pages/inbox/${conversation.id}`);
    } catch (err) {
      console.error("Error creating announcement:", err);
      setError("Failed to send announcement. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!isLoaded || (isLoaded && user?.publicMetadata?.role !== "prof")) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

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
              <h1 className="text-lg font-medium">Class Announcement</h1>
            </div>
          </div>

          {/* Announcement Composer */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
              {/* Course selection */}
              <div className="mb-4">
                <label htmlFor="courseSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Course:
                </label>
                <select
                  id="courseSelect"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
                >
                  <option value="">-- Select a course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Students display */}
              {selectedCourse && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients:
                  </label>
                  {loading ? (
                    <div className="flex justify-center p-4">
                      <div className="w-6 h-6 border-4 border-t-[#AAFF45] border-[#d1e3bb] rounded-full animate-spin"></div>
                    </div>
                  ) : students.length > 0 ? (
                    <div className="border rounded-md p-2 max-h-32 overflow-y-auto bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">
                        This announcement will be sent to all {students.length} students enrolled in {courseInfo?.code}.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {students.map(student => (
                          <span key={student.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {student.firstName} {student.lastName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-500">No students found in this course.</p>
                  )}
                </div>
              )}

              {/* Message input */}
              <div className="mb-12">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Announcement Message:
                </label>
                <ReactQuillEditor
                  value={message}
                  onChange={setMessage}
                  height="200px"
                />
              </div>

              {/* Empty spacer div */}
              <div className="h-20"></div>

              {/* Error message */}
              {error && (
                <div className="mb-4 text-red-500 text-sm">{error}</div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2 mt-40">
                <button
                  onClick={() => router.push("/pages/inbox")}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendAnnouncement}
                  disabled={sending || !selectedCourse || !message.trim()}
                  className={`px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-[#8FE03D] ${
                    (sending || !selectedCourse || !message.trim()) ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {sending ? "Sending..." : "Send Announcement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
