//page for viewing and interacting with specific assignments
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";
import StudentFileUpload from "@/app/components/student_file_upload";
import ReactQuillEditor from "@/app/components/text_editor";
import FileViewer from "@/app/components/file_viewer";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  points: number;
  dueDate: string;
  submissionType: "NO_SUBMISSIONS" | "ONLINE";
  onlineSubmissionMethod: "TEXT_ENTRY" | "FILE_UPLOAD" | null;
  published: boolean;
  availableUntil: string | null;
  allowedAttempts: number;
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

interface AssignmentFile {
  id: string;
  fileName: string;
  fileUrl: string;
}

interface AssignmentGrade {
  pointsEarned: number | null;
  totalPoints: number;
  feedback?: string | null;
  isLate?: boolean;
  status?: "NOT_SUBMITTED" | "SUBMITTED" | "GRADED";
}

const ViewAssignment = () => {
  const params = useParams() as { courseId: string; assignmentId: string };
  const router = useRouter();
  const { courseId, assignmentId } = params;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignmentFiles, setAssignmentFiles] = useState<AssignmentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [textSubmission, setTextSubmission] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<AssignmentFile | null>(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [assignmentGrade, setAssignmentGrade] = useState<AssignmentGrade | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assignment: ${response.status}`);
        }
        
        const data = await response.json();
        setAssignment(data);
      } catch (error) {
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch assignment files
    const fetchAssignmentFiles = async () => {
      try {
        setFilesLoading(true);
        const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/files`);
        
        if (response.ok) {
          const data = await response.json();
          setAssignmentFiles(data.files || []);
        } else {
          console.error("Failed to fetch assignment files:", response.status);
        }
      } catch (error) {
        console.error("Error fetching assignment files:", error);
      } finally {
        setFilesLoading(false);
      }
    };

    // Fetch submissions if the assignment allows them
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

    const fetchAssignmentGrade = async () => {
      try {
        console.log(`Fetching grade data for assignment: ${assignmentId} in course: ${courseId}`);
        const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/grade`);
    
        if (response.ok) {
          const gradeData = await response.json();
          console.log("Grade data received:", gradeData);
          setAssignmentGrade({
            pointsEarned: gradeData.pointsEarned,
            totalPoints: gradeData.totalPoints,
            feedback: gradeData.feedback,
            isLate: gradeData.isLate,
            status: gradeData.status
          });
        } else {
          // Log the HTTP error status
          console.error(`Failed to fetch grade data: HTTP ${response.status}`);
          try {
            // Try to get error details from response
            const errorData = await response.text();
            console.error("Error response:", errorData);
          } catch (parseError) {
            console.error("Could not parse error response");
          }
        }
      } catch (error) {
        console.error("Error fetching assignment grade:", error);
        // Don't throw the error - just log it and continue
        // This prevents the component from crashing
      }
    };

    if (courseId && assignmentId) {
      fetchAssignment();
      fetchAssignmentFiles();
      fetchSubmissions();
      fetchAssignmentGrade();
    }
  }, [courseId, assignmentId]);

  // Handler for file uploads from the StudentFileUpload component
  const handleFileUpload = (fileUrl: string, fileName: string) => {
    if (assignment && submissions.length >= assignment.allowedAttempts) { 
      alert(`You have reached the maximum number of allowed submissions (${assignment.allowedAttempts.toString()}). No more submissions will be accepted.`);
      return;
    }
    setSubmitSuccess(true);
    
    // Refresh submissions after upload
    setTimeout(() => {
      const fetchSubmissions = async () => {
        try {
          const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submissions`);
          if (response.ok) {
            const data = await response.json();
            setSubmissions(data.submissions || []);
          }
        } catch (error) {
          console.error("Error fetching submissions:", error);
        }
      };
      
      fetchSubmissions();
    }, 1000);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignment) return;

    if (submissions.length >= assignment.allowedAttempts) { 
      alert(`You have reached the maximum number of allowed submissions (${assignment.allowedAttempts.toString()}). No more submissions will be accepted.`);
      return;
    }
    
    if (textSubmission.trim() === "") {
      setSubmitError("Please enter some text before submitting");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const formData = new FormData();
      formData.append("text", textSubmission);
      
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
      setTextSubmission("");
      
      // Add the new submission to the list
      setSubmissions(prev => [data.submission, ...prev]);
    } catch (error) {
      console.error("Error submitting text:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to view a file
  const viewFile = (file: AssignmentFile) => {
    setSelectedFile(file);
    setShowFileViewer(true);
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

  // Function to get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '/asset/pdf_icon.svg';
      case 'doc':
      case 'docx':
        return '/asset/file_icon.svg';
      case 'ppt':
      case 'pptx':
        return '/asset/file_icon.svg';
      case 'xls':
      case 'xlsx':
        return '/asset/file_icon.svg';
      default:
        return '/asset/file_icon.svg';
    }
  };

  const canSubmit = assignment && submissions.length < assignment.allowedAttempts;

  if (loading) {
    return (
      <div className="flex">
        <Sidebar_dashboard />
        <CourseMenu courseId={courseId} />
        <div className="flex-1 pl-52 px-6 flex justify-center items-center h-screen">
          <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
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

  // Check if this assignment allows submissions
  const submissionsAllowed = assignment.submissionType === "ONLINE";
  const isTextSubmission = assignment.onlineSubmissionMethod === "TEXT_ENTRY";
  const isFileSubmission = assignment.onlineSubmissionMethod === "FILE_UPLOAD";

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId} />
      <div className="flex-1 pl-52 px-6 py-6">
        {showFileViewer && selectedFile ? (
          <div className="fixed inset-0 z-50 bg-white pt-16">
            <div className="flex justify-end px-6 py-2">
              <button 
                onClick={() => setShowFileViewer(false)}
                className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Back to Assignment
              </button>
            </div>
            <FileViewer fileUrl={selectedFile.fileUrl} />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-1">
              <h1 className="text-xl font-medium">{assignment.title}</h1>
                <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 rounded transition duration-200 group"
                >
                <img 
                  src="/asset/back_icon.svg" 
                  alt="Back" 
                  className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1" 
                />
                <span className="text-sm font-medium">Prev</span>
                </button>
            </div>

            <div className="bg-white rounded overflow-hidden">
              <div>
                <div className="flex gap-2 border-gray-800 border-t border-b p-2">
                  <div>
                    <span className="text-black">Due: </span>
                    <span className="font-medium text-sm">{formatDueDate(assignment.dueDate)}</span>
                  </div>
                  {assignment.availableUntil && (
                    <div>
                      <span className="text-black">Available Until: </span>
                      <span className="font-medium text-sm">{formatDueDate(assignment.availableUntil)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-black">Points: </span>
                    <span className="font-medium">{assignment.points}</span>
                  </div>
                  <div>
                    <span className="text-black">Attempts Allowed: </span>
                    <span className="font-medium">{assignment.allowedAttempts}</span>
                  </div>
                </div>

              <div className="gap-2 border-gray-800 border-t border-b p-2 mb-5">
                <div className="text-base pt-1 pb-5">
                  {assignment.description ? (
                    <div dangerouslySetInnerHTML={{ __html: assignment.description }} />
                  ) : (
                    <p className="text-gray-500 italic">No instructions provided.</p>
                  )}
                </div>
              </div>
              </div>
                {assignmentFiles.length > 0 && (
                <div className="">
                <ul className="">
                  {assignmentFiles.map((file) => (
                  <li key={file.id}>
                    <a 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                    >
                    {file.fileName}
                    </a>
                  </li>
                  ))}
                </ul>
                </div>
              )}
            </div>

            {/* Assignment Files Section - show if there are files */}

            {submissions.length > 0 && (
              <div className="">
                <div className="">
                <h3 className="text-lg font-medium ">Submissions</h3>
                </div>
                <div className="">
                  <div className="overflow-x-auto">
                    <div className="space-y-4">
                        {submissions.map((submission) => (
                        <div key={submission.id} className=" flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <a 
                          onClick={(e) => {
                          e.preventDefault();
                          viewFile({
                          id: submission.id,
                          fileName: submission.fileName,
                          fileUrl: submission.fileUrl
                          });
                          }}
                          className="text-blue-600 hover:underline cursor-pointer"
                          >
                          {submission.fileName}
                          </a>
                          <div className="text-sm text-gray-500">
                          {formatSubmissionDate(submission.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          submission.status === 'GRADED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {submission.status}
                          </span>
                          <div className="text-sm text-gray-500">
                          {submission.grade !== null 
                          ? `${submission.grade}/${assignment.points}` 
                          : assignmentGrade && assignmentGrade.pointsEarned !== null 
                          ? `${assignmentGrade.pointsEarned}/${assignmentGrade.totalPoints}` 
                          : "Not graded yet"
                          }
                          {assignmentGrade?.isLate && (
                          <div className="text-xs text-yellow-600">
                          Submitted Late
                          </div>
                          )}
                          </div>
                          {(submission.feedback || assignmentGrade?.feedback) && (
                          <button
                            className="text-blue-600 text-xs hover:underline"
                            onClick={() => alert(submission.feedback || assignmentGrade?.feedback || "No detailed feedback available")}
                          >
                            View Feedback
                          </button>
                          )}
                        </div>
                        </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Section - Only show if submissions are allowed */}
            {submissionsAllowed ? (
              <div className="overflow-hidden">

                <div className="">
                  {submitSuccess ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                      Assignment submitted successfully!
                    </div>
                  ) : (
                    <>
                      {submitError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                          {submitError}
                        </div>
                      )}
                      
                      {isFileSubmission && (
                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-4">File Upload</h3>
                          {!canSubmit && assignment ? (
                            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                              You have reached the maximum number of allowed submissions ({assignment.allowedAttempts}).
                            </div>
                          ) : (
                            <StudentFileUpload
                              assignmentId={assignmentId}
                              courseId={courseId}
                              onUpload={handleFileUpload}
                            />
                          )}
                          <p className="mt-1 text-sm text-gray-500">
                            Accepted file types: PDF, DOC, DOCX, ZIP
                          </p>
                        </div>
                      )}
                      
                      {isTextSubmission && (
                        <div className="mb-4 mt-2">
                          <form onSubmit={handleTextSubmit}>
                            <div className="mb-4">
                              <div className="flex justify-end">
                              <button
                                type="submit"
                                className={`px-4 py-2 rounded mb-4 ${
                                submitting 
                                  ? "bg-gray-400 cursor-not-allowed" 
                                  : "bg-[#AAFF45] hover:bg-[#B9FF66]"
                                }`}
                                disabled={submitting}
                              >
                                {submitting 
                                  ? "Submitting..." 
                                  : submissions.length > 0 
                                  ? "Submit Another One" 
                                  : "Submit"}
                              </button>
                              </div>
                          
                              <ReactQuillEditor 
                                value={textSubmission}
                                onChange={setTextSubmission}
                                height="200px"
                              />
                            </div>
                            <div>
                            </div>
                          </form>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="">
                  <p className="">
                    This assignment does not require a submission. It may be for informational purposes only.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewAssignment;
