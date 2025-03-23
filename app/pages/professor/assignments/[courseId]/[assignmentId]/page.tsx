"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import ReactQuillEditor from "@/app/components/text_editor";

interface Assignment {
  id: string;
  title: string;
  description: string;
  points: string;
  dueDate: string;
  dueTime: string;
}

const AssignmentDetails = () => {
  const router = useRouter();
  const params = useParams() as { courseId: string; assignmentId: string };
  const { courseId, assignmentId } = params;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    if (courseId && assignmentId) {
      // Fetch assignment details using the individual assignment API route
      fetch(`/api/courses/${courseId}/assignments/${assignmentId}`)
        .then((res) => res.json())
        .then((data) => {
          setAssignment(data);
          setDescription(data.description || "");
        })
        .catch((error) => {
          console.error("Error fetching assignment:", error);
        });
    }
  }, [courseId, assignmentId]);

  const handleSaveDescription = async () => {
    if (!assignment) return;
    const payload = { ...assignment, description };
    try {
      const res = await fetch(
        `/api/courses/${courseId}/assignments/${assignment.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        alert("Assignment updated successfully!");
        setIsEditingDescription(false);
      } else {
        const errorData = await res.json();
        alert(`Failed to update assignment: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert("An error occurred while updating the assignment.");
    }
  };

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading assignment details...</p>
      </div>
    );
  }

  // For displaying local due time correctly:
  const localDueTime = assignment.dueDate
    ? (() => {
        const dt = new Date(assignment.dueDate);
        const hh = dt.getHours().toString().padStart(2, "0");
        const mm = dt.getMinutes().toString().padStart(2, "0");
        return `${hh}:${mm}`;
      })()
    : "";

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId} />
      <div className="flex-1 pl-52 px-6">
        <h1 className="text-2xl font-bold mb-6">Edit Assignment: {assignment.title}</h1>

        <div className="mb-4">
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            value={assignment.title}
            readOnly
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        {/* Description Section */}
        <div className="mb-4 relative">
          <label className="block font-medium mb-1">Description</label>
          {isEditingDescription ? (
            <>
              <ReactQuillEditor
                value={description}
                onChange={setDescription}
                height="200px"
              />
              <button
                onClick={handleSaveDescription}
                className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 rounded"
              >
                Save
              </button>
            </>
          ) : (
            <div className="border p-2 rounded bg-gray-100 relative">
              {/* Render HTML content. Make sure your description is sanitized if coming from an external source */}
              <div dangerouslySetInnerHTML={{ __html: description }} />
              <button
                onClick={() => setIsEditingDescription(true)}
                className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Points</label>
          <input
            type="text"
            value={assignment.points}
            readOnly
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>

        <div className="mb-4 flex gap-4">
          <div>
            <label className="block font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={assignment.dueDate.split("T")[0]} // assuming ISO string
              readOnly
              className="border p-2 rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Due Time</label>
            <input
              type="time"
              value={localDueTime}
              readOnly
              className="border p-2 rounded bg-gray-100"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => router.back()}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;
