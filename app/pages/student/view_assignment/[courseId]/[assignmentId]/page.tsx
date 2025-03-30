//Student interface for viewing assignment details, with  form for submitting assignments. Will also display prev submissions with grades.

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";

interface Assignment {
  id: string;
  title: string;
  description: string;
  points: number;
  dueDate: string;
}

interface Submission {
  id: string;
  fileName: string;
  fileUrl: string;
  status: "DRAFT" | "SUBMITTED" | "GRADED";
  grade: number | null;
  feedback: string | null;
  createdAt: string;
}

const ViewAssignment = () => {
  const params = useParams() as { courseId: string; assignmentId: string };
  const router = useRouter();
  const { courseId, assignmentId } = params;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  useEffect(() => {
    // Fetch assignment details
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}`);
        if (!response.ok) throw new Error("Failed to fetch assignment");
        
        const data = await response.json();
        setAssignment(data);
      } catch (error) {
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch submissions
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submissions`);
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setSubmissionsLoading(false);
      }
    };

    if (courseId && assignmentId) {
      fetchAssignment();
      fetchSubmissions();
    }
  }, [courseId, assignmentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setSubmitError("Please select a file to submit");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", file);
      
      // Send the submission to the API
      const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submissions`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit assignment");
      }

      const data = await response.json();
      
      setSubmitSuccess(true);
      setFile(null);
      
      // Add the new submission to the list
      setSubmissions(prev => [data.submission, ...prev]);
      
      // Reset the file input
      const fileInput = document.getElementById("assignmentFile") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format due date for display
  const formatDueDate = (dateString: string) => {
    if (!dateString) return "No due date";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date for submissions
  const formatSubmissionDate = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar_dashboard />
        <CourseMenu courseId={courseId} />
        <div className="flex-1 pl-52 px-6 flex justify-center items-center h-screen">
          <div className="w-8 h-8 border-4 border-t-[#AAFF45] border-[#d1e3bb] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex">
        <Sidebar_dashboard />
        <CourseMenu courseId={courseId} />
        <div className="flex-1 pl-52 px-6 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Assignment not found. It may have been deleted or you don't have permission to view it.
          </div>
          <button 
            onClick={() => router.back()} 
            className="mt-4 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId} />
      <div className="flex-1 pl-52 px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Back to Assignments
          </button>
        </div>

        <div className="bg-white shadow-md rounded-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="mb-4 flex justify-between">
              <div>
                <span className="text-gray-600">Due: </span>
                <span className="font-medium">{formatDueDate(assignment.dueDate)}</span>
              </div>
              <div>
                <span className="text-gray-600">Points: </span>
                <span className="font-medium">{assignment.points}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-medium mb-2">Instructions</h2>
              {assignment.description ? (
                <div dangerouslySetInnerHTML={{ __html: assignment.description }} />
              ) : (
                <p className="text-gray-500 italic">No instructions provided.</p>
              )}
            </div>
          </div>
        </div>

        {/* Previous Submissions Section */}
        {submissions.length > 0 && (
          <div className="bg-white shadow-md rounded-md overflow-hidden mb-8">
            <div className="bg-[#B9FF66] p-4 font-medium">
              Your Submissions
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a 
                            href={submission.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {submission.fileName}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatSubmissionDate(submission.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            submission.status === 'GRADED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.grade !== null 
                            ? `${submission.grade}/${assignment.points}` 
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Submit Assignment Section */}
        <div className="bg-white shadow-md rounded-md overflow-hidden">
          <div className="bg-[#B9FF66] p-4 font-medium">
            {submissions.length > 0 ? "Submit Another Attempt" : "Submit Assignment"}
          </div>
          <div className="p-6">
            {submitSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Assignment submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {submitError}
                  </div>
                )}
                
                <div>
                  <label htmlFor="assignmentFile" className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File
                  </label>
                  <input
                    id="assignmentFile"
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none"
                    disabled={submitting}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted file types: PDF, DOC, DOCX, ZIP
                  </p>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md ${
                      submitting 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-[#AAFF45] hover:bg-[#B9FF66]"
                    }`}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Assignment"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAssignment;
