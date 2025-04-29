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
  submissionType: string;
  onlineSubmissionMethod?: string;
  published: boolean;
  availableUntil: string | null;
  allowedAttempts: string;
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
  const [selectedOnlineMethod, setSelectedOnlineMethod] = useState<
    string | null
  >(null);
  const [showFiles, setShowFiles] = useState(false);
  const [availableUntil, setAvailableUntil] = useState<string | null>(null);
  const [allowedAttempts, setAllowedAttempts] = useState<string>("1"); // Default to 1

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
          setAvailableUntil(
            data.availableUntil
              ? new Date(data.availableUntil).toISOString().split("T")[0]
              : null
          );
          setAllowedAttempts(data.allowedAttempts?.toString() || "1");

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
      const res = await fetch(
        `/api/courses/${courseId}/assignments/${assignmentId}/submissions/count`
      );
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

    const combinedDueDateTime =
      dueDate && dueTime ? new Date(`${dueDate}T${dueTime}:00`) : null;

    // Format availableUntil to ISO string if it has a value
    const formattedAvailableUntil = availableUntil
      ? new Date(`${availableUntil}T23:59:59`).toISOString()
      : null;

    const payload = {
      ...assignment,
      title,
      description,
      points: parseInt(points, 10),
      dueDate: combinedDueDateTime ? combinedDueDateTime.toISOString() : null,
      submissionType: formattedSubmissionType,
      onlineSubmissionMethod:
        formattedSubmissionType === "ONLINE"
          ? selectedOnlineMethod?.toUpperCase()
          : null,
      availableUntil: formattedAvailableUntil,
      allowedAttempts: parseInt(allowedAttempts, 10),
    };

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
        setIsEditing(false);
      } else {
        const errorData = await res.json();
        alert(
          `Failed to update assignment: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert("An error occurred while updating the assignment.");
    }
  };

  const fetchFiles = async (courseId: string, assignmentId: string) => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/assignments/${assignmentId}/files`
      );
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
    router.push(
      `/pages/professor/assignments/${courseId}/${assignmentId}/file/${fileId}`
    );
  };

  const handlePublish = async () => {
    if (!assignment) return;

    const confirmPublish = confirm(
      "Are you sure you want to publish this assignment?"
    );
    if (!confirmPublish) return;

    try {
      const payload = { published: true };

      const res = await fetch(
        `/api/courses/${courseId}/assignments/${assignment.id}/publish`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        alert("Assignment published successfully!");
        setIsPublished(true);
        setAssignment((prev) => (prev ? { ...prev, published: true } : null));
        // Fetch submission stats when published
        fetchSubmissionsCount();
        fetchEnrolledStudents();
      } else {
        const errorData = await res.json();
        alert(
          `Failed to publish assignment: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error publishing assignment:", error);
      alert("An error occurred while publishing the assignment.");
    }
  };

  const handleUnpublish = async () => {
    if (!assignment) return;

    const confirmUnpublish = confirm(
      "Are you sure you want to unpublish this assignment?"
    );
    if (!confirmUnpublish) return;

    try {
      const payload = { published: false };

      const res = await fetch(
        `/api/courses/${courseId}/assignments/${assignment.id}/publish`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        alert("Assignment unpublished successfully!");
        setIsPublished(false);
        setAssignment((prev) => (prev ? { ...prev, published: false } : null));
        // Reset submission stats when unpublished
        setSubmissionCount(0);
        setTotalStudents(0);
      } else {
        const errorData = await res.json();
        alert(
          `Failed to unpublish assignment: ${
            errorData.error || "Unknown error"
          }`
        );
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
    <div className="flex min-h-screen bg-gradient-to-t from-[#AAFF45]/15 to-white">
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId} />

      <div className="flex-1 pl-52 px-4 py-4">
        <div className="bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-gray-800">
                {assignment.title}
              </h1>
              {isPublished ? (
                <div className="relative group">
                  <button
                    onClick={handleUnpublish}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src="/asset/publish_icon.svg"
                      alt="Published"
                      className="w-5 h-5"
                    />
                  </button>
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Unpublish Assignment
                  </span>
                </div>
              ) : (
                <div className="relative group">
                  <button
                    onClick={handlePublish}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src="/asset/unpublish_icon.svg"
                      alt="Unpublished"
                      className="w-5 h-5"
                    />
                  </button>
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Publish Assignment
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Back</span>
              </button>
              <button
                onClick={isEditing ? handleSaveAll : () => setIsEditing(true)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg text-black transition-colors flex items-center gap-1 ${
                  isEditing
                    ? "bg-[#B9FF66] hover:bg-[#A8FF00]"
                    : "bg-[#B9FF66] hover:bg-[#A8FF00]"
                }`}
              >
                {isEditing ? (
                  <>
                    <span>Save Changes</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Edit Assignment</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mb-2">
            {isPublished && (
              <div className="border border-black px-3 py-1 rounded-lg">
                <span className="text-sm text-gray-700">
                  {totalStudents > 0 ? (
                    <span>
                      {submissionCount} student{submissionCount !== 1 && "s"}{" "}
                      submitted out of {totalStudents}
                    </span>
                  ) : (
                    <span>Loading submission data...</span>
                  )}
                </span>
              </div>
            )}
            <button
              onClick={() =>
                router.push(
                  `/pages/professor/assignments/${courseId}/${assignmentId}/quick-grader`
                )
              }
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[#B9FF66] text-black hover:bg-[#A8FF00] transition-colors flex items-center gap-1"
            >
              <span>Quick Grader</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                readOnly={!isEditing}
                className={`w-full border border-black p-1.5 rounded-lg transition-colors text-base ${
                  isEditing
                    ? "bg-white focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]"
                    : "bg-white"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Side */}
              <div className="space-y-4">
                {/* Points */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Points
                  </label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full border border-black p-1.5 rounded-lg transition-colors text-base ${
                      isEditing
                        ? "bg-white focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]"
                        : "bg-white"
                    }`}
                  />
                </div>

                {/* Available Until */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Available Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={availableUntil || ""}
                    onChange={(e) => setAvailableUntil(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full border border-black p-1.5 rounded-lg transition-colors text-base ${
                      isEditing
                        ? "bg-white focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]"
                        : "bg-white"
                    }`}
                  />
                </div>
              </div>

              {/* Right Side */}
              <div className="space-y-4">
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full border border-black p-1.5 rounded-lg transition-colors text-base ${
                      isEditing
                        ? "bg-white focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]"
                        : "bg-white"
                    }`}
                  />
                </div>

                {/* Due Time */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    readOnly={!isEditing}
                    className={`w-full border border-black p-1.5 rounded-lg transition-colors text-base ${
                      isEditing
                        ? "bg-white focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]"
                        : "bg-white"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Submission Type Selection */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Submission Type
              </label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value)}
                disabled={!isEditing}
                className={`w-full border border-black p-1.5 rounded-lg transition-colors text-base ${
                  isEditing
                    ? "bg-white focus:border-[#B9FF66] focus:ring-1 focus:ring-[#B9FF66]"
                    : "bg-white"
                }`}
              >
                <option value="NO_SUBMISSIONS">No Submissions</option>
                <option value="ONLINE">Online Submission</option>
              </select>
            </div>

            {/* Conditional Rendering of Submission Options */}
            {submissionType === "ONLINE" && (
              <div className="border border-black p-1.5 rounded-lg">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Submission Options
                </label>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="submission-option"
                      id="text_entry"
                      value="TEXT_ENTRY"
                      checked={selectedOnlineMethod === "TEXT_ENTRY"}
                      onChange={(e) => setSelectedOnlineMethod(e.target.value)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-[#B9FF66] focus:ring-[#B9FF66]"
                    />
                    <label
                      htmlFor="text_entry"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Text Entry
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="submission-option"
                      id="file_upload"
                      value="FILE_UPLOAD"
                      checked={selectedOnlineMethod === "FILE_UPLOAD"}
                      onChange={(e) => setSelectedOnlineMethod(e.target.value)}
                      disabled={!isEditing}
                      className="w-4 h-4 text-[#B9FF66] focus:ring-[#B9FF66]"
                    />
                    <label
                      htmlFor="file_upload"
                      className="ml-2 text-sm text-gray-700"
                    >
                      File Upload
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Section */}
            <div className="border border-black p-1.5 rounded-lg">
              <h2 className="text-base font-semibold mb-1 text-gray-800">
                Upload Files
              </h2>
              <div className="text-sm">
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
              </div>

              {/* Uploaded Files Section */}
              <div className="mt-2">
                <h2 className="text-base font-semibold mb-1 text-gray-800">
                  Uploaded Files
                </h2>
                <ul className="space-y-1">
                  {files.length > 0 ? (
                    files.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between bg-white p-2 rounded-lg border border-black"
                      >
                        <a
                          onClick={() => handleNavigate(file.id)}
                          className="text-[#B9FF66] hover:text-[#A8FF00] cursor-pointer text-base"
                        >
                          {file.fileName}
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Delete file"
                        >
                          <img
                            src="/asset/delete_icon.svg"
                            alt="Delete"
                            className="w-4 h-4"
                          />
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 italic">
                      No files uploaded yet.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Description
              </label>
              {isEditing ? (
                <ReactQuillEditor
                  value={description}
                  onChange={setDescription}
                  height="150px"
                />
              ) : (
                <div className="border border-black rounded-lg p-1.5 bg-white w-full">
                  <div
                    className="ql-editor text-base"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;
