"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseCard from "@/app/components/course_card";
import CalendarWidget from "@/app/components/CalendarWidget";
import TodoList from "@/app/components/TodoList";
import Image from "next/image";

interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export default function ProfessorDashboard() {
  const { isLoaded, user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/courses/professor");
          if (!response.ok) throw new Error("Failed to fetch courses");
          const data = await response.json();
          setCourses(data);
        } catch (error) {
          console.error("Error fetching courses:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCourses();
    }
  }, [isLoaded]);

  if (!isLoaded || loading) {
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
      <div className="flex h-screen flex-1 pl-16 bg-gradient-to-t from-[#AAFF45]/15 to-white">
        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Left Section - User Greeting and Courses */}
            <div className="col-span-2">
              <h1 className="text-base font-semibold mb-4">
                Hi, Professor {user ? user.fullName || user.firstName : "Guest"}
              </h1>
              <div className="relative">
                <h1 className="font-bold text-xl mb-4">Courses</h1>
                <div
                  className="max-h-[410px] overflow-y-auto scrollbar-hide pr-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="space-y-6 px-1 relative z-0">
                    {" "}
                    {/* Add space between cards and room to scale */}
                    {courses.length === 0 ? (
                      <p>No courses assigned.</p>
                    ) : (
                      courses.map((course) => (
                        <div key={course.id} className="relative z-10">
                          {" "}
                          {/* Local wrapper to preserve hover scaling */}
                          <CourseCard
                            courseId={course.id}
                            courseName={course.name}
                            assignmentsDue={Math.floor(Math.random() * 5)}
                            notifications={Math.floor(Math.random() * 5)}
                            schedule="MWF 10:00 AM"
                            upcomingClassDate="March 4, 2025"
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {courses.length > 2 && (
                  <div className="absolute bottom-0 left-[280px] opacity-45">
                    <Image
                      src="/asset/arrowdown_icon.svg"
                      alt="Add icon"
                      width={30}
                      height={30}
                      priority
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Calendar, To-do List, and Announcements */}
            <div className="col-span-1 space-y-4">
              {/* Calendar Component */}
              <CalendarWidget />

              {/* To-do List */}
              <div>
                <TodoList />
              </div>

              {/* Announcements */}
              <div>
                <h2 className="text-base font-semibold mb-2">Announcement</h2>
                <div className="bg-white p-2 rounded-lg shadow border border-black text-center">
                  <p className="text-gray-700 text-base">No Announcement</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
