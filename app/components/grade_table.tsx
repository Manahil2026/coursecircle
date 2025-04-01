interface Assignment {
  id: number;
  dueDate: string;
  name: string;
  score: number|null;
  points: number;
  graded: boolean;
}

interface Student {
  name: string;
  assignments: Assignment[];
  attendance: number;
}

const GradeTable = ({
  students,
  updateScore,
}: {
  students: Student[];
  updateScore: (
    studentIndex: number,
    assignmentIndex: number,
    newScore: number|null,
    graded: boolean
  ) => void;
}) => {
  const calculateGrade = (assignments: Assignment[]): string => {
    // Filter out ungraded assignments
    const gradedAssignments = assignments.filter(
      (assignment) => assignment.graded && assignment.score !== null
    );

    // If no assignments are graded, return "N/A"
    if (gradedAssignments.length === 0) {
      return "N/A";
    }

    // Calculate the total score and total possible points
    const totalScore = gradedAssignments.reduce((acc, assignment) => acc + (assignment.score ?? 0), 0);
    const totalPoints = gradedAssignments.reduce((acc, assignment) => acc + assignment.points, 0);

    // Calculate the percentage
    const percentage = (totalScore / totalPoints) * 100;

    return `${percentage.toFixed(2)}%`; // Format to 2 decimal places
  };

  return (
    <table className="w-full table-auto border-collapse text-sm">
      <thead>
        <tr className="bg-gray-200 text-left">
          <th className="px-4 py-2">Student Name</th>
          <th className="px-4 py-2">Attendance (%)</th>
          {/* Dynamically render assignment headers */}
          {students[0]?.assignments.map((assignment, index) => (
            <th key={index} className="px-4 py-2">{assignment.name}</th>
          ))}
          <th className="px-4 py-2">Average Grade</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student, studentIndex) => (
          <tr key={studentIndex} className="border-b border-gray-400">
            <td className="px-4 py-2">{student.name}</td>
            <td className="px-4 py-2">{student.attendance}%</td>
            {student.assignments.map((assignment, assignmentIndex) => (
              <td key={assignmentIndex} className="px-4 py-2">
                <div className="flex flex-col items-center">
                  {/* Input field for the grade */}
                  <input
                    type="number"
                    value={assignment.graded ? assignment.score ?? "" : ""}
                    onChange={(e) =>
                      updateScore(
                        studentIndex,
                        assignmentIndex,
                        assignment.graded ? Number(e.target.value) : null,
                        assignment.graded
                      )
                    }
                    disabled={!assignment.graded} // Disable input if "N/A" is selected
                    className={`w-14 border-[0.1px] ${
                      assignment.graded ? "bg-[#AAFF45]" : "bg-gray-200"
                    } border-black rounded-md px-2 py-1 text-center appearance-none outline-none focus:outline-none`}
                  />

                  {/* Toggle for marking as "N/A" */}
                  <label className="flex items-center mt-1 text-xs text-gray-500">
                    <input
                      type="checkbox"
                      checked={!assignment.graded}
                      onChange={() =>
                        updateScore(
                          studentIndex,
                          assignmentIndex,
                          null, // Set score to null when toggling to "N/A"
                          !assignment.graded
                        )
                      }
                      className="mr-1"
                    />
                    N/A
                  </label>

                  <span className="text-xs text-gray-500 mt-1">Out of {assignment.points}</span>
                </div>
              </td>
            ))}
            <td className="px-4 py-2">{calculateGrade(student.assignments)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default GradeTable;
