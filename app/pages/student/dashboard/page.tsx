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
        <h1 className="text-base font-semibold mb-4">
          Hi, {user ? user.fullName : "Guest"}
        </h1>
        {/* Testing card */}
        <div></div>
        <CourseCard
          courseName="Python Programming"
          assignmentsDue={10}
          notifications={4}
          schedule="Tues/Thurs"
          upcomingClassDate="Thursday 20"
        />

        <CourseCard
          courseName="Software Programming"
          assignmentsDue={10}
          notifications={4}
          schedule="Tues/Thurs"
          upcomingClassDate="Thursday 20"
        />

        <CourseCard
          courseName="Math"
          assignmentsDue={10}
          notifications={4}
          schedule="Tues/Thurs"
          upcomingClassDate="Thursday 20"
        />
      </main>
    </div>
  );
}
