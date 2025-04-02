import React from 'react';

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
    <div className="w-full overflow-x-auto">
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
                    onClick={() => alert(assignment.feedback)}
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

