import React, { useState, useEffect } from "react";

interface CourseFormProps {
  onCreateCourse: (courseData: {
    name: string;
    code: string;
    description: string;
    professorId: string | null;
  }) => Promise<void>;
}

const CourseForm: React.FC<CourseFormProps> = ({ onCreateCourse }) => {
  const [courseData, setCourseData] = useState({
    name: "",
    code: "",
    description: "",
    professorId: ""
  });
  
  const [error, setError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async () => {
    // Only validate name and code as required
    if (!courseData.name || !courseData.code) {
      setError("Course name and code are required");
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Pass empty professorId as null
    await onCreateCourse({
      ...courseData,
      professorId: courseData.professorId.trim() === "" ? null : courseData.professorId
    });
    
    // Reset form
    setCourseData({
      name: "",
      code: "",
      description: "",
      professorId: ""
    });
  };

  return (
    <div className="mt-1 p-2">
      <h2 className="text-lg font-medium">Create New Course</h2>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={courseData.name}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 border rounded"
              placeholder="Course Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={courseData.code}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 border rounded"
              placeholder="Course Code (e.g., CS101)"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Course Description
            </label>
            <textarea
              name="description"
              value={courseData.description}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 border rounded"
              placeholder="Course Description"
              rows={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Professor ID (Optional)
            </label>
            <input
              type="text"
              name="professorId"
              value={courseData.professorId}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 border rounded"
              placeholder="Professor ID (leave blank if not assigned yet)"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-[#AAFF45] text-black rounded hover:bg-[#7dba32]"
        >
          Create Course
        </button>
      </div>
    </div>
  );
};

export default CourseForm;
