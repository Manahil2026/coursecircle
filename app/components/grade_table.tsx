interface Assignment {
  name: string;
  dueDate: string;
  submissionDate: string;
  score: number;
}

const GradeTable = ({
  assignments,
  attendance,
  updateScore,
}: {
  assignments: Assignment[];
  attendance: number;
  updateScore: (index: number, newScore: number) => void;
}) => {
  const calculateGrade = (assignments: Assignment[]): string => {
    const total = assignments.reduce(
      (acc, assignment) => acc + assignment.score,
      0
    );
    return (total / assignments.length).toFixed(2);
  };

  return (
    <table className="w-full table-auto border-collapse text-sm">
      <thead>
        <tr className="bg-gray-200 text-left">
          <th className="px-4 py-2">Assignment Name</th>
          <th className="px-4 py-2">Due Date</th>
          <th className="px-4 py-2">Submission Date</th>
          <th className="px-4 py-2">Score</th>
        </tr>
      </thead>
      <tbody>
        {assignments.map((assignment, index) => (
          <tr key={index} className="border-b border-gray-400">
            <td className="px-4 py-2">{assignment.name}</td>
            <td className="px-4 py-2">{assignment.dueDate}</td>
            <td className="px-4 py-2">{assignment.submissionDate}</td>
            <td className="px-4 py-2">
              <input
                type="number"
                value={assignment.score}
                onChange={(e) => updateScore(index, Number(e.target.value))}
                className="w-14 border-[0.1px] bg-[#AAFF45] border-black rounded-md px-2 py-1 text-center appearance-none outline-none focus:outline-none"
              />
            </td>
          </tr>
        ))}
        <tr className="font-medium">
          <td
            colSpan={3}
            className="px-4 py-2 text-left bg-[#AAFF45] border-b-[1px] border-black"
          >
            Average Grade
          </td>
          <td className="px-4 py-2 bg-[#AAFF45] border-b-[1px] border-black">
            {calculateGrade(assignments)}
          </td>
        </tr>
        <tr className="font-medium">
          <td
            colSpan={3}
            className="px-4 py-2 text-left bg-[#AAFF45] border-b-[1px] border-black"
          >
            Attendance (%)
          </td>
          <td className="px-4 py-2 border-b-[1px] border-black bg-[#AAFF45]">
            {attendance}%
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default GradeTable;
