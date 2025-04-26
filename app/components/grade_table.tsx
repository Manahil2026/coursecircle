import { useEffect, useState } from "react";

interface Assignment {
  id: number;
  name: string;
  score: number | null;
  points: number;
  graded: boolean;
  previousScore?: number | null;
  dueDate?: string;
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border text-left">Student</th>
            {assignments.map((assignment) => (
              <th key={assignment.id} className="p-2 border text-center">
                <div className="flex flex-col">
                  <span className="font-medium">{assignment.name}</span>
                  <span className="text-xs text-gray-500">
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '—'}
                  </span>
                </div>
              </th>
            ))}
            <th className="p-2 border text-center">Average</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50 border-b">
              <td className="p-2 border">{student.name}</td>
              {student.assignments.map((assignment) => (
                <td key={assignment.id} className="p-2 border text-center">
                  <input
                    type="number"
                    value={assignment.score ?? ""}
                    onChange={(e) => {
                      const newScore = e.target.value === "" ? null : Number(e.target.value);
                      updateScore(
                        student.id,
                        assignment.id,
                        newScore,
                        newScore !== null
                      );
                    }}
                    className="w-16 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-[#AAFF45]"
                    placeholder="—"
                    min="0"
                    max={assignment.points}
                  />
                </td>
              ))}
              <td className="p-2 border text-center font-medium">
                {student.average}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GradeTable;
