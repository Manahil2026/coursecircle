'use client';
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
  submissionType: string;
  onlineSubmissionMethod?: string;
  published: boolean;
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

  // Editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [files, setFiles] = useState<AssignmentFile[]>([]);
  const [submissionType, setSubmissionType] = useState("NO_SUBMISSIONS");
  const [selectedOnlineMethod, setSelectedOnlineMethod] = useState<string | null>(null);
  const [showFiles, setShowFiles] = useState(false);

  // New state variables for submissions count
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  const [totalStudents, setTotalStudents] = useState<number>(0);

  // Fetch assignment details
  useEffect(() => {
    if (courseId && assignmentId) {
      fetch(`/api/courses/${courseId}/assignments/${assignmentId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setAssignment(data);

          // Initialize states with fetched data
          setTitle(data.title || "");
          setDescription(data.description || "");
          setPoints(data.points?.toString() || "0");
          setIsPublished(data.published || false);

          if (data.dueDate) {
            const dateObj = new Date(data.dueDate);
            setDueDate(dateObj.toISOString().split("T")[0]); // yyyy-mm-dd
            setDueTime(
              dateObj.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            );
          }

          setSubmissionType(data.submissionType || "NO_SUBMISSIONS");
          setSelectedOnlineMethod(data.onlineSubmissionMethod || null);
          setFiles(data.files || []);

          // If the assignment is published, fetch submission stats
          if (data.published) {
            fetchSubmissionsCount();
            fetchEnrolledStudents();
          }
        })
        .catch((error) => {
          console.error("Error fetching assignment:", error);
        });
    }
  }, [courseId, assignmentId]);

  // Fetch submissions for the assignment and count unique student submissions
  const fetchSubmissionsCount = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submissions/count`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setSubmissionCount(data.submissionCount);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  // Fetch course details to get total enrolled students
  const fetchEnrolledStudents = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Assuming data.students is an array of enrolled students
      setTotalStudents(data.students?.length || 0);
    } catch (error) {
      console.error("Error fetching course details:", error);
    }
  };

  // Save assignment changes
  const handleSaveAll = async () => {
    if (!assignment) return;

    const validSubmissionTypes = ["NO_SUBMISSIONS", "ONLINE"];
    const formattedSubmissionType = submissionType.toUpperCase();
    if (!validSubmissionTypes.includes(formattedSubmissionType)) {
      alert("Invalid submission type");
      return;
    }

    const combinedDueDateTime = dueDate && dueTime
      ? new Date(`${dueDate}T${dueTime}:00`)
      : null;

    const payload = {
      ...assignment,
      title,
      description,
      points: parseInt(points, 10),
      dueDate: combinedDueDateTime ? combinedDueDateTime.toISOString() : null,
      submissionType: formattedSubmissionType,
      onlineSubmissionMethod:
        formattedSubmissionType === "ONLINE" ? selectedOnlineMethod?.toUpperCase() : null,
    };

    try {
      const res = await fetch(`/api/courses/${courseId}/assignments/${assignment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Assignment updated successfully!");
        setIsEditing(false);
      } else {
        const errorData = await res.json();
        alert(`Failed to update assignment: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert("An error occurred while updating the assignment.");
    }
  };

  const fetchFiles = async (courseId: string, assignmentId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/files`);
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      return data.files;
    } catch (error) {
      console.error("Error fetching files:", error);
      return [];
    }
  };

  const handleShowFiles = async () => {
    const fetchedFiles = await fetchFiles(courseId, assignmentId);
    setFiles(fetchedFiles);
    setShowFiles(!showFiles);
  };

  const handleNavigate = (fileId: string) => {
    router.push(`/pages/professor/assignments/${courseId}/${assignmentId}/file/${fileId}`);
  };

  const handlePublish = async () => {
    if (!assignment) return;

    const confirmPublish = confirm("Are you sure you want to publish this assignment?");
    if (!confirmPublish) return;

    try {
      const payload = { published: true };

      const res = await fetch(`/api/courses/${courseId}/assignments/${assignment.id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Assignment published successfully!");
        setIsPublished(true);
        setAssignment((prev) => prev ? { ...prev, published: true } : null);
        // Fetch submission stats when published
        fetchSubmissionsCount();
        fetchEnrolledStudents();
      } else {
        const errorData = await res.json();
        alert(`Failed to publish assignment: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error publishing assignment:", error);
      alert("An error occurred while publishing the assignment.");
    }
  };

  const handleUnpublish = async () => {
    if (!assignment) return;

    const confirmUnpublish = confirm("Are you sure you want to unpublish this assignment?");
    if (!confirmUnpublish) return;

    try {
      const payload = { published: false };

      const res = await fetch(`/api/courses/${courseId}/assignments/${assignment.id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Assignment unpublished successfully!");
        setIsPublished(false);
        setAssignment((prev) => prev ? { ...prev, published: false } : null);
        // Reset submission stats when unpublished
        setSubmissionCount(0);
        setTotalStudents(0);
      } else {
        const errorData = await res.json();
        alert(`Failed to unpublish assignment: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error unpublishing assignment:", error);
      alert("An error occurred while unpublishing the assignment.");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this file?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/courses/assignment-files/${fileId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
        alert("File deleted successfully!");
      } else {
        const errorData = await res.json();
        alert(`Failed to delete file: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("An error occurred while deleting the file.");
    }
  };

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId} />

      <div className="flex-1 pl-52 px-6 py-6">
        <div className="bg-white rounded shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {assignment.title}
              {isPublished ? (
                <div className="relative group">
                  <img
                    src="/asset/publish_icon.svg"
                    alt="Published"
                    className="w-6 h-6 cursor-pointer"
                    onClick={handleUnpublish}
                  />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100">
                    Unpublish
                  </span>
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src="/asset/unpublish_icon.svg"
                    alt="Unpublished"
                    className="w-6 h-6 cursor-pointer"
                    onClick={handlePublish}
                  />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100">
                    Publish
                  </span>
                </div>
              )}
            </div>

            {/* Submission Stats and Quick Grader Button */}
            <div className="flex items-center gap-4">
              {isPublished && (
                <div className="text-sm text-gray-700">
                  {totalStudents > 0 ? (
                    <span>
                      {submissionCount} student{submissionCount !== 1 && "s"} submitted out of {totalStudents}
                    </span>
                  ) : (
                    <span>Loading submission data...</span>
                  )}
                </div>
              )}
              <button
                onClick={() => router.push(`/courses/${courseId}/assignments/${assignmentId}/quick-grader`)}
                className="px-4 py-2 text-sm rounded bg-[#B9FF66] text-black hover:bg-[#A8FF00] shadow-md"
              >
                Quick Grader
              </button>
            </div>
          </h1>

          {/* Title */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={!isEditing}
              className={`w-full border p-2 rounded ${isEditing ? "border-gray-300 bg-white" : "bg-gray-100"}`}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Description</label>
            {isEditing ? (
              <ReactQuillEditor
                value={description}
                onChange={setDescription}
                height="200px"
              />
            ) : (
              <div className="border border-gray-300 rounded p-2 bg-gray-50 w-full">
                <div
                  className="ql-editor"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            )}
          </div>

          {/* Points */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 mt-14 text-gray-700">Points</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              readOnly={!isEditing}
              className={`w-full border p-2 rounded ${isEditing ? "border-gray-300 bg-white" : "bg-gray-100"}`}
            />
          </div>

          {/* Due Date and Time */}
          <div className="mb-6 flex flex-wrap gap-6">
            <div className="flex-1 min-w-[150px]">
              <label className="block font-semibold mb-2 text-gray-700">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                readOnly={!isEditing}
                className={`border p-2 rounded w-full ${isEditing ? "border-gray-300 bg-white" : "bg-gray-100"}`}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block font-semibold mb-2 text-gray-700">Due Time</label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                readOnly={!isEditing}
                className={`border p-2 rounded w-full ${isEditing ? "border-gray-300 bg-white" : "bg-gray-100"}`}
              />
            </div>
          </div>

          {/* Submission Type Selection */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-700">Submission Type</label>
            <select
              value={submissionType}
              onChange={(e) => setSubmissionType(e.target.value)}
              disabled={!isEditing}
              className={`w-full border p-2 rounded ${isEditing ? "border-gray-300 bg-white" : "bg-gray-100"}`}
            >
              <option value="NO_SUBMISSIONS">No Submissions</option>
              <option value="ONLINE">Online Submission</option>
            </select>
          </div>

          {/* Conditional Rendering of Submission Options */}
          {submissionType === "ONLINE" && (
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-gray-700">Submission Options</label>
              <div className="flex gap-4">
                <div>
                  <input
                    type="radio"
                    name="submission-option"
                    id="text_entry"
                    value="TEXT_ENTRY"
                    checked={selectedOnlineMethod === "TEXT_ENTRY"}
                    onChange={(e) => setSelectedOnlineMethod(e.target.value)}
                    disabled={!isEditing}
                  />
                  <label htmlFor="text_entry" className="ml-2">Text Entry</label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="submission-option"
                    id="file_upload"
                    value="FILE_UPLOAD"
                    checked={selectedOnlineMethod === "FILE_UPLOAD"}
                    onChange={(e) => setSelectedOnlineMethod(e.target.value)}
                    disabled={!isEditing}
                  />
                  <label htmlFor="file_upload" className="ml-2">File Upload</label>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Component */}
          <h2 className="text-lg font-semibold mb-2">Upload Files</h2>
          <FileUpload
            assignmentId={assignment.id}
            courseId={courseId}
            onUpload={(fileUrl, fileName) =>
              setFiles((prev) => [
                ...prev,
                { id: Date.now().toString(), fileUrl, fileName },
              ])
            }
          />

          {/* Uploaded Files Section */}
          <div className="bg-gray-100 shadow-md rounded p-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">Uploaded Files</h2>
              <img
                src={showFiles ? "/asset/arrowup_icon.svg" : "/asset/arrowdown_icon.svg"}
                alt={showFiles ? "Collapse" : "Expand"}
                className="w-6 h-6 cursor-pointer hover:opacity-80"
                onClick={handleShowFiles}
              />
            </div>
            {showFiles && (
              <ul className="list-disc pl-5 mt-4">
                {files.length > 0 ? (
                  files.map((file) => (
                    <li key={file.id} className="flex items-center gap-4">
                      <a
                        onClick={() => handleNavigate(file.id)}
                        className="text-lime-600 hover:underline cursor-pointer"
                      >
                        {file.fileName}
                      </a>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete file"
                      >
                        <img
                          src="/asset/delete_icon.svg"
                          alt="Delete"
                          className="w-5 h-5"
                        />
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600">No files uploaded yet.</li>
                )}
              </ul>
            )}
          </div>

          {/* Bottom Button Row */}
          <div className="flex justify-end gap-2">
            <button
              onClick={isEditing ? handleSaveAll : () => setIsEditing(true)}
              className={`px-4 py-2 rounded text-white ${isEditing ? "bg-[#B9FF66] hover:bg-[#A8FF00]" : "bg-gray-500 hover:bg-gray-600"}`}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
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
