import React, { useState } from 'react';

interface Assignment {
  id: string;
  name: string;
  dueDate: string;
  points: number;
  grade: number | null;
  submissionDate?: string;
  feedback?: string | null;
}

interface StudentGradeTableProps {
  assignments: Assignment[];
  attendance?: number;
}

const StudentGradeTable: React.FC<StudentGradeTableProps> = ({ 
  assignments, 
  attendance 
}) => {
  // State for feedback modal
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState("");
  const [activeFeedbackTitle, setActiveFeedbackTitle] = useState("");
  
  // Handle viewing feedback
  const handleViewFeedback = (feedback: string | null | undefined, assignmentName: string) => {
    setActiveFeedback(feedback || "No detailed feedback provided.");
    setActiveFeedbackTitle(assignmentName);
    setShowFeedback(true);
  };

  // Calculate overall grade
  const calculateOverallGrade = () => {
    // Filter out assignments without grades
    const gradedAssignments = assignments.filter(
      assignment => assignment.grade !== null
    );

    if (gradedAssignments.length === 0) {
      return "N/A";
    }

    // Calculate total points earned and total possible points
    const totalPointsEarned = gradedAssignments.reduce(
      (total, assignment) => total + (assignment.grade || 0), 
      0
    );
    const totalPossiblePoints = gradedAssignments.reduce(
      (total, assignment) => total + assignment.points, 
      0
    );

    // Calculate percentage
    const percentage = (totalPointsEarned / totalPossiblePoints) * 100;
    return `${percentage.toFixed(2)}%`;
  };

  // Determine letter grade
  const calculateLetterGrade = (percentage: string) => {
    if (percentage === "N/A") return "N/A";

    const numPercentage = parseFloat(percentage);
    if (numPercentage >= 90) return "A";
    if (numPercentage >= 80) return "B";
    if (numPercentage >= 70) return "C";
    if (numPercentage >= 60) return "D";
    return "F";
  };

  const overallPercentage = calculateOverallGrade();
  const letterGrade = calculateLetterGrade(overallPercentage);

  return (
    <div className="w-full relative">
      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Feedback: {activeFeedbackTitle}</h3>
              <button 
                onClick={() => setShowFeedback(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="prose">
              {activeFeedback}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 bg-[#AAFF45] rounded hover:bg-[#9BEF36] focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border text-left">Assignment</th>
            <th className="p-2 border text-center">Due Date</th>
            <th className="p-2 border text-center">Submission Date</th>
            <th className="p-2 border text-center">Points</th>
            <th className="p-2 border text-center">Grade</th>
            <th className="p-2 border text-center">Feedback</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr 
              key={assignment.id} 
              className="hover:bg-gray-50 border-b"
            >
              <td className="p-2 border">{assignment.name}</td>
              <td className="p-2 border text-center">
                {new Date(assignment.dueDate).toLocaleDateString()}
              </td>
              <td className="p-2 border text-center">
                {assignment.submissionDate 
                  ? new Date(assignment.submissionDate).toLocaleDateString() 
                  : "Not Submitted"}
              </td>
              <td className="p-2 border text-center">
                {assignment.points}
              </td>
              <td className="p-2 border text-center">
                {assignment.grade !== null 
                  ? `${assignment.grade}/${assignment.points}` 
                  : "—"}
              </td>
              <td className="p-2 border text-center">
                {assignment.feedback ? (
                  <button 
                    onClick={() => handleViewFeedback(assignment.feedback, assignment.name)}
                    className="text-blue-600 hover:underline"
                  >
                    View Feedback
                  </button>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td colSpan={3} className="p-2 border">Overall Grade</td>
            <td className="p-2 border text-center">
              {assignments.reduce((total, a) => total + a.points, 0)}
            </td>
            <td colSpan={2} className="p-2 border text-center">
              {overallPercentage} ({letterGrade})
            </td>
          </tr>
          {attendance !== undefined && (
            <tr className="bg-gray-50">
              <td colSpan={6} className="p-2 border">
                Attendance: {attendance}%
              </td>
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
};

export default StudentGradeTable;
