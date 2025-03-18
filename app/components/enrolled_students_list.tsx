import React, { useState } from "react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface EnrolledStudentsListProps {
  courseId: string;
  students: Student[];
  onStudentsRemoved: () => void;
}

const EnrolledStudentsList: React.FC<EnrolledStudentsListProps> = ({
  courseId,
  students,
  onStudentsRemoved
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleRemoveStudents = async () => {
    if (selectedStudents.length === 0) {
      setError("Please select at least one student to remove");
      return;
    }

    try {
      setIsRemoving(true);
      setError(null);
      
      const response = await fetch(`/api/admin/courses/${courseId}/enroll`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudents })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove students');
      }

      // Reset selected students
      setSelectedStudents([]);
      
      // Notify parent component to refresh the course data
      onStudentsRemoved();
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      console.error(err);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Enrolled Students ({students.length})</h3>
        {selectedStudents.length > 0 && (
          <button
            onClick={handleRemoveStudents}
            disabled={isRemoving}
            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:bg-red-300"
          >
            {isRemoving ? 'Removing...' : `Remove Selected (${selectedStudents.length})`}
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {students.length === 0 ? (
        <p className="text-gray-500 text-sm">No students enrolled in this course</p>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <span className="sr-only">Select</span>
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelect(student.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {student.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EnrolledStudentsList;
