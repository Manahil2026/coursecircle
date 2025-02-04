"use client"; 

import React from 'react';
import { useUser } from "@clerk/nextjs";
import Sidebar_dashboard from '@/app/components/sidebar_dashboard';

export default function StudentDashboard() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar_dashboard />
      <main className="flex-1 p-6">
        <h1 className="text-base font-semibold mb-4">
          Hi, {user ? user.fullName : 'Guest'}
        </h1>
      </main>
    </div>
  );
}