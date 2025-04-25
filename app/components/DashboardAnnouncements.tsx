// app/components/DashboardAnnouncements.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Announcement {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  messagePreview: string;
  timestamp: string;
  sender: string;
}

const DashboardAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/announcements/recent");
        if (!response.ok) throw new Error("Failed to fetch announcements");
        
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      if (hours < 1) return "Just now";
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
    }
    
    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return days === 1 ? "Yesterday" : `${days} days ago`;
    }
    
    // Format as date
    return date.toLocaleDateString();
  };

  const handleAnnouncementClick = (announcementId: string) => {
    router.push(`/pages/inbox/${announcementId}`);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border border-black h-[150px] flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-t-[#AAFF45] border-[#d1e3bb] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white p-2 rounded-lg text-center">
        <p className="text-gray-700 text-base">No Announcements</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow border border-black">
      <div className="space-y-2 max-h-[180px] overflow-y-auto">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            onClick={() => handleAnnouncementClick(announcement.id)}
            className="p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm">{announcement.courseCode}</span>
              <span className="text-xs text-gray-500">{formatTimestamp(announcement.timestamp)}</span>
            </div>
            <p className="text-sm text-gray-700 truncate">
              {announcement.messagePreview.replace(/<[^>]*>?/gm, '')}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardAnnouncements;
