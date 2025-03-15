import React, { useState } from "react";

interface CourseFormProps {
  onCreateCourse: (courseData: {
    name: string;
    code: string;
    description: string;
    professorId: string;
  }) => Promise<void>;
}

const CourseForm: React.FC<CourseFormProps> = ({ onCreateCourse }) => {
  const [courseData, setCourseData] = useState({
    name: "",
    code: "",
    description: "",
    professorId: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async () => {
    await onCreateCourse(courseData);
    setCourseData({
      name: "",
      code: "",
      description: "",
      professorId: ""
    });
  };

  return (
    <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
      <h2 className="text-xl font-semibold">Create New Course</h2>
      <div className="space-y-4 mt-4">
        <div>
          <input
            type="text"
            name="name"
            value={courseData.name}
            onChange={handleInputChange}
            className="w-full mt-2 p-2 border rounded-md"
            placeholder="Course Name"
          />
        </div>
        <div>
          <input
            type="text"
            name="code"
            value={courseData.code}
            onChange={handleInputChange}
            className="w-full mt-2 p-2 border rounded-md"
            placeholder="Course Code (e.g., CS101)"
          />
        </div>
        <div>
          <textarea
            name="description"
            value={courseData.description}
            onChange={handleInputChange}
            className="w-full mt-2 p-2 border rounded-md"
            placeholder="Course Description"
            rows={3}
          />
        </div>
        <div>
          <input
            type="text"
            name="professorId"
            value={courseData.professorId}
            onChange={handleInputChange}
            className="w-full mt-2 p-2 border rounded-md"
            placeholder="Professor ID"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
        >
          Create Course
        </button>
      </div>
    </div>
  );
};

export default CourseForm;
