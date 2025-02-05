"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseCard from "@/app/components/course_card";

export default function StudentDashboard() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar_dashboard />
      <main className="flex-1 p-6 overflow-y-auto space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Left Section - User Greeting and Courses */}
          <div className="col-span-2">
            <h1 className="text-base font-semibold mb-4">
              Hi, {user ? user.fullName : "Guest"}
            </h1>
            <h1 className="font-bold text-xl">My Course</h1>
            <div className="space-y-4">
              <CourseCard
                courseName="Python Programming"
                assignmentsDue={10}
                notifications={4}
                schedule="Tues/Thurs"
                upcomingClassDate="Thursday 20"
              />

              <CourseCard
                courseName="Software Engineering"
                assignmentsDue={10}
                notifications={4}
                schedule="Tues/Thurs"
                upcomingClassDate="Thursday 20"
              />

              <CourseCard
                courseName="Networking"
                assignmentsDue={10}
                notifications={4}
                schedule="Tues/Thurs"
                upcomingClassDate="Thursday 20"
              />
            </div>
          </div>

          {/* Right Section - Calendar, To-do List, and Announcements */}
          <div className="col-span-1 space-y-4">
            <div className="rounded-lg shadow">
              <h2 className="text-base font-semibold mb-4">Feb 2025</h2>
              <div className="grid grid-cols-7 text-center font-medium bg-[#AAFF45] rounded-lg">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="font-semibold">{day}</div>
                ))}
                {[...Array(7)].map((_, index) => (
                  <div key={index} className="font-semibold">{index + 2}</div>
                ))}
              </div>
            </div>

            {/* To-do List */}
            <div>
              <h2 className="text-base font-semibold mb-2">To-do List</h2>
              <div className="bg-white p-2 rounded-lg shadow">
                <ul className="space-y-2">
                  <li className="bg-black text-white p-4 rounded-lg">
                    03 | Study for SE (Due 11:55)
                  </li>
                  <li className="bg-gray-200 p-4 rounded-lg">
                    04 | Drink Water (Due 11:55)
                  </li>
                  <li className="bg-gray-200 p-4 rounded-lg">
                    06 | Touch Grass (Due 11:55)
                  </li>
                </ul>
              </div>
            </div>

            {/* Announcements */}
            <div>
              <h2 className="text-base font-semibold mb-2  ">Announcement</h2>
              <div className="bg-white p-2 rounded-lg shadow border border-black text-center ">
                <p className="text-gray-600 text-base">No Announcement</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
