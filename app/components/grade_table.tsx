import { useEffect, useState } from "react";

interface Assignment {
  id: number;
  name: string;
  score: number | null;
  points: number;
  graded: boolean;
  previousScore?: number | null;
}

interface Student {
  id: number;
  name: string;
  assignments: Assignment[];
  average: number | string;
}

interface GradeTableProps {
  students: Student[];
  assignments: Assignment[];
  updateScore: (
    studentId: number,
    assignmentId: number,
    newScore: number | null,
    graded: boolean
  ) => void;
}

const GradeTable: React.FC<GradeTableProps> = ({ students, assignments, updateScore }) => {
  return (
    <table className="w-full table-auto border-collapse text-sm">
      <thead>
        <tr className="bg-gray-200 text-left">
          <th className="px-4 py-2">Student Name</th>
          {assignments.map((assignment) => (
            <th key={assignment.id} className="px-4 py-2">
              {(assignment as any).name ?? (assignment as any).title ?? "Untitled"}
            </th>
          ))}
          <th className="px-4 py-2">Average</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id} className="border-b border-gray-400">
            <td className="px-4 py-2">{student.name}</td>
            {student.assignments.map((assignment) => (
              <td key={assignment.id} className="px-4 py-2">
                <input
                  type="number"
                  value={
                    assignment.graded && assignment.score !== null
                      ? Number(assignment.score.toFixed(2)) // Round to 2 decimal places
                      : ""
                  }
                  onChange={(e) =>
                    updateScore(
                      student.id,
                      assignment.id,
                      assignment.graded ? Number(e.target.value) : null,
                      assignment.graded
                    )
                  }
                  disabled={!assignment.graded} // Disable input if "N/A" is selected
                  className={`w-14 border-[0.1px] ${assignment.graded ? "bg-[#AAFF45]" : "bg-gray-200"
                    } border-black rounded-md px-2 py-1 text-center appearance-none outline-none focus:outline-none`}
                />
                {/* Toggle for marking as "N/A" */}
                <label className="flex items-center mt-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={!assignment.graded}
                    onChange={() => {
                      if (assignment.graded) {
                        // Disabling: Store the current score in `previousScore`
                        updateScore(
                          student.id,
                          assignment.id,
                          null, // Set the score to null when disabling
                          false // Disable grading
                        );
                      } else {
                        // Enabling: Restore the score from `previousScore`
                        updateScore(
                          student.id,
                          assignment.id,
                          assignment.previousScore ?? 0, // Restore the previous score or default to 0
                          true // Re-enable grading
                        );
                      }
                    }}
                  />
                  Disable
                </label>

                <span className="text-xs text-gray-500 mt-1">Out of {assignment.points}</span>
              </td>
            ))}
            <td className="px-4 py-2">
              {typeof student.average === "number"
                ? `${student.average.toFixed(2)}%`
                : "N/A"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default GradeTable;
