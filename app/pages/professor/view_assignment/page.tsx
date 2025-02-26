'use client';
import CourseMenu from '@/app/components/course_menu';
import Sidebar_dashboard from '@/app/components/sidebar_dashboard';
import React from 'react'

const ViewAssignment = () => {


  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu />
      <div className="flex-1 p-6 ml-48">
      </div>
    </div>
  );
};

export default ViewAssignment;

