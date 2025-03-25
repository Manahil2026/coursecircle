"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import ReactQuillEditor from "@/app/components/text_editor";
import "react-quill-new/dist/quill.snow.css";
import FileUpload from "@/app/components/file_upload";


interface Assignment {
  id: string;
  title: string;
  description: string;
  points: string;
  dueDate: string;
  dueTime: string;
}

interface AssignmentFile {
  id: string;
  fileName: string;
  fileUrl: string;
}

const AssignmentDetails = () => {
  const router = useRouter();
  const params = useParams() as { courseId: string; assignmentId: string };
  const { courseId, assignmentId } = params;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [files, setFiles] = useState<AssignmentFile[]>([]);

  useEffect(() => {
    if (courseId && assignmentId) {
      fetch(`/api/courses/${courseId}/assignments/${assignmentId}`)
        .then((res) => res.json())
        .then((data) => {
          setAssignment(data);
          setDescription(data.description || "");
          setFiles(data.files || []);
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
      const res = await fetch(`/api/courses/${courseId}/assignments/${assignment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
        <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Format local due time
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

      <div className="flex-1 pl-52 px-6 py-6">
        <div className="bg-white rounded shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">
            Edit Assignment: {assignment.title}
          </h1>

          {/* Title */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Title</label>
            <input
              type="text"
              value={assignment.title}
              readOnly
              className="w-full border border-gray-300 p-2 rounded bg-gray-100"
            />
          </div>

          {/* Description Section */}
          <div className="mb-20">
            {/* Heading + Edit/Save Button on the same line */}
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-gray-700">Description</label>
              {isEditingDescription ? (
                <button
                  onClick={handleSaveDescription}
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              )}
            </div>

            {/* If editing, show Quill with NO behind box; if not, show a bordered box */}
            {isEditingDescription ? (
              <ReactQuillEditor
                value={description}
                onChange={setDescription}
                height="200px"
              />
            ) : (
              <div className="border border-gray-300 rounded p-2 bg-gray-50 w-full">
                <div className="ql-editor" dangerouslySetInnerHTML={{ __html: description }} />
              </div>
            )}
          </div>

          {/* Points */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Points</label>
            <input
              type="text"
              value={assignment.points}
              readOnly
              className="w-full border border-gray-300 p-2 rounded bg-gray-100"
            />
          </div>

          {/* Due Date and Due Time */}
          <div className="mb-6 flex flex-wrap gap-6">
            <div className="flex-1 min-w-[150px]">
              <label className="block font-semibold mb-2 text-gray-700">Due Date</label>
              <input
                type="date"
                value={assignment.dueDate.split("T")[0]}
                readOnly
                className="border border-gray-300 p-2 rounded bg-gray-100 w-full"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block font-semibold mb-2 text-gray-700">Due Time</label>
              <input
                type="time"
                value={localDueTime}
                readOnly
                className="border border-gray-300 p-2 rounded bg-gray-100 w-full"
              />
            </div>
          </div>

          {/* File Upload Section (for professors) */}
          <FileUpload
            assignmentId={assignment.id}
            courseId={courseId}
            onUpload={(fileUrl, fileName) => setFiles(prev => [...prev, { id: Date.now().toString(), fileUrl, fileName }])}
          />

          {/* List Uploaded Files */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
            <ul className="list-disc pl-5">
              {files.map((file) => (
                <li key={file.id}>
                  <a
                    href={`/courses/${courseId}/assignments/${assignment.id}/file/${file.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {file.fileName}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Button Row */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.back()}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;
