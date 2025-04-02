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
        const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/grade`);
    
        if (response.ok) {
          const gradeData = await response.json();
          setAssignmentGrade({
            pointsEarned: gradeData.pointsEarned,
            totalPoints: gradeData.totalPoints,
            feedback: gradeData.feedback,
            isLate: gradeData.isLate,
            status: gradeData.status
          });
        }
      } catch (error) {
        console.error("Error fetching assignment grade:", error);
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
    
    if (textSubmission.trim() === "") {
      setSubmitError("Please enter some text before submitting");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // Create a text file from the submission
      const blob = new Blob([textSubmission], { type: 'text/plain' });
      const textFile = new File([blob], "text_submission.txt", { type: 'text/plain' });
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", textFile);
      
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

            {/* Assignment Files Section - show if there are files */}
            {assignmentFiles.length > 0 && (
              <div className="bg-white shadow-md rounded-md overflow-hidden mb-8">
                <div className="bg-[#B9FF66] p-4 font-medium">
                  Assignment Files
                </div>
                <div className="p-6">
                  {filesLoading ? (
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-t-[#AAFF45] border-[#d1e3bb] rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {assignmentFiles.map((file) => (
                        <li key={file.id} className="py-3 flex items-center hover:bg-gray-50 cursor-pointer" onClick={() => viewFile(file)}>
                          <img 
                            src={getFileIcon(file.fileName)}
                            alt="File" 
                            className="w-5 h-5 mr-3"
                          />
                          <span className="flex-1">{file.fileName}</span>
                          <button 
                            className="px-3 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
                          >
                            View
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Previous Submissions Section - only shown if there are any */}
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
                              {assignmentGrade ? (
                                assignmentGrade.pointsEarned !== null 
                                  ? `${assignmentGrade.pointsEarned}/${assignmentGrade.totalPoints}` 
                                  : "—"
                              ) : (
                                '-'
                              )}
                              {assignmentGrade?.isLate && (
                                <div className="text-xs text-yellow-600 mt-1">
                                  Submitted Late
                                </div>
                              )}
                              {assignmentGrade?.feedback && (
                                <div className="mt-1">
                                  <button
                                    className="text-blue-600 text-xs hover:underline"
                                    onClick={() => alert(assignmentGrade?.feedback)}
                                  >
                                    View Feedback
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Section - Only show if submissions are allowed */}
            {submissionsAllowed ? (
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
                    <>
                      {submitError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                          {submitError}
                        </div>
                      )}
                      
                      {isFileSubmission && (
                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-4">File Upload</h3>
                          <StudentFileUpload
                            assignmentId={assignmentId}
                            courseId={courseId}
                            onUpload={handleFileUpload}
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Accepted file types: PDF, DOC, DOCX, ZIP
                          </p>
                        </div>
                      )}
                      
                      {isTextSubmission && (
                        <div className="mb-6">
                          <h3 className="text-lg font-medium mb-4">Text Submission</h3>
                          <form onSubmit={handleTextSubmit}>
                            <div className="mb-4">
                              <ReactQuillEditor 
                                value={textSubmission}
                                onChange={setTextSubmission}
                                height="200px"
                              />
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
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-md overflow-hidden">
                <div className="bg-[#B9FF66] p-4 font-medium">
                  Submission Information
                </div>
                <div className="p-6">
                  <p className="text-gray-700">
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
