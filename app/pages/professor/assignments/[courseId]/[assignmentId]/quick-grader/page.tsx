"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Submission {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;  // submission date/time
  grade?: number;
  feedback?: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const QuickGraderPage = () => {
  const { courseId, assignmentId } = useParams() as {
    courseId: string;
    assignmentId: string;
  };
  const router = useRouter();

  // State to hold all submissions for this assignment
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  // Index of the currently displayed submission
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Local state for grade and feedback
  // (Alternatively, you could store these in an object keyed by submissionId)
  const [grade, setGrade] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState<string>("");

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all submissions for this assignment
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `/api/courses/${courseId}/assignments/${assignmentId}/submissions`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch submissions: ${res.status}`);
        }
        const data = await res.json();
        // data.submissions is assumed to be an array
        setSubmissions(data.submissions || []);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Error fetching submissions");
        setIsLoading(false);
      }
    };

    if (courseId && assignmentId) {
      fetchSubmissions();
    }
  }, [courseId, assignmentId]);

  // Whenever currentIndex changes, update local grade/feedback with that submission’s existing data
  useEffect(() => {
    if (submissions.length > 0 && currentIndex < submissions.length) {
      const submission = submissions[currentIndex];
      setGrade(submission.grade);
      setFeedback(submission.feedback || "");
    }
  }, [currentIndex, submissions]);

  // Handle saving the current submission’s grade and feedback
  const handleSaveGrade = async () => {
    if (!submissions[currentIndex]) return;
    const submissionId = submissions[currentIndex].id;

    try {
      const res = await fetch(
        `/api/courses/${courseId}/assignments/${assignmentId}/submissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            submissionId,
            grade,
            feedback,
            status: "GRADED", // if you want to mark as GRADED
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update submission");
      }

      // If successful, you could automatically move to next student:
      // goToNextStudent();
      alert("Grade saved successfully!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Navigation
  const goToNextStudent = () => {
    if (currentIndex < submissions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPreviousStudent = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // If loading or error
  if (isLoading) {
    return <div className="p-4">Loading submissions...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  if (submissions.length === 0) {
    return <div className="p-4">No submissions found.</div>;
  }

  // The current submission
  const currentSubmission = submissions[currentIndex];
  const studentName = `${currentSubmission.student.firstName} ${currentSubmission.student.lastName}`;

  return (
    <div className="flex h-screen">
      {/* Left side: Submission display */}
      <div className="w-3/5 border-r p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-2">
          {studentName}&apos;s Submission
        </h2>

        <p className="text-sm text-gray-500">
          Submitted on: {new Date(currentSubmission.createdAt).toLocaleString()}
        </p>

        {/* If it's a PDF, you can embed it. Otherwise, show a link or do a file preview. */}
        {currentSubmission.fileUrl.toLowerCase().endsWith(".pdf") ? (
          <iframe
            src={currentSubmission.fileUrl}
            className="mt-4 flex-1"
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <div className="mt-4">
            <a
              href={currentSubmission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Open submission file
            </a>
          </div>
        )}
      </div>

      {/* Right side: Grading panel */}
      <div className="w-2/5 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousStudent}
            disabled={currentIndex === 0}
            className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
          >
            &larr; Prev
          </button>
          <div>
            <strong>
              {currentIndex + 1} / {submissions.length}
            </strong>
          </div>
          <button
            onClick={goToNextStudent}
            disabled={currentIndex === submissions.length - 1}
            className="bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
          >
            Next &rarr;
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-2">Grade & Feedback</h2>
        <label className="block text-sm font-medium mb-1">Grade</label>
        <input
          type="number"
          value={grade ?? ""}
          onChange={(e) => setGrade(Number(e.target.value))}
          className="border rounded w-full mb-4 p-2"
          placeholder="Enter a grade..."
        />

        <label className="block text-sm font-medium mb-1">Feedback</label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="border rounded w-full p-2 mb-4"
          rows={6}
          placeholder="Write feedback for the student..."
        />

        <button
          onClick={handleSaveGrade}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Submit Grade
        </button>
      </div>
    </div>
  );
};

export default QuickGraderPage;
