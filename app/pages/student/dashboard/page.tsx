"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseCard from "@/app/components/course_card";
import CalendarWidget from "@/app/components/CalendarWidget";
import Image from "next/image";

interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export default function StudentDashboard() {
  const { isLoaded, user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      const fetchCourses = async () => {
        try {
          const response = await fetch("/api/courses/student"); 
          if (response.ok) {
            const data = await response.json();
            setCourses(data);
          } else {
            console.error("Error fetching courses:", response.statusText);
          }
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
      <div className="flex h-screen flex-1 pl-16">
        <main className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Left Section - User Greeting and Courses */}
            <div className="col-span-2">
              <h1 className="text-base font-semibold mb-4">
                Hi, {user ? user.fullName || user.firstName : "Guest"}
              </h1>
              <h1 className="font-bold text-xl">Courses</h1>
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <p>No courses enrolled.</p>
                ) : (
                  courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      courseId={course.id}
                      courseName={course.name}
                      assignmentsDue={Math.floor(Math.random() * 5)} // Replace with actual count
                      notifications={Math.floor(Math.random() * 5)} // Replace with actual count
                      schedule="MWF 10:00 AM" // Replace with real data
                      upcomingClassDate="March 4, 2025" // Replace with real data
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Section - Calendar, To-do List, and Announcements */}
            <div className="col-span-1 space-y-4">
              {/* Calendar Component */}
              <CalendarWidget />

              {/* To-do List */}
              <div>
                <div className="flex justify-between">
                  <h2 className="text-base font-semibold mb-2">To-do List</h2>
                  <button>
                    <Image
                      src="/asset/add_icon.svg"
                      alt="Add icon"
                      width={27}
                      height={27}
                      priority
                    />
                  </button>
                </div>

                <div className="bg-white p-2 rounded-lg">
                  <ul className="space-y-2">
                    <li className="bg-black text-white p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:transform hover:scale-105">
                      03 | Study for SE (Due 11:55)
                    </li>
                    <li className="bg-white p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:transform hover:scale-105">
                      04 | Drink Water (Due 11:55)
                    </li>
                    <li className="bg-white p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:transform hover:scale-105">
                      06 | Touch Grass (Due 11:55)
                    </li>
                  </ul>
                </div>
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