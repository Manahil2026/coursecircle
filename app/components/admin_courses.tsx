"use client";
import React, { useState, useEffect } from "react";
import CourseForm from "@/app/components/course_form";
import EnrolledStudentsList from "@/app/components/enrolled_students_list";

// Interface definitions
interface Professor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  professor?: Professor;
  professorId?: string;
  students: Student[];
  assignments: Assignment[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
}

const AdminCoursesPage: React.FC = () => {
  // State for course management
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Enrollment states
  const [enrollmentCourse, setEnrollmentCourse] = useState<string>("");
  const [enrollmentStudents, setEnrollmentStudents] = useState<string[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Professor assignment states
  const [showProfessorForm, setShowProfessorForm] = useState(false);
  const [selectedProfessorId, setSelectedProfessorId] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Admin navigation links
  const adminLinks = [
    { key: "dashboard", label: "Dashboard", path: "/pages/admin/dashboard" },
    { key: "courses", label: "Courses", path: "/pages/admin/courses" },
    { key: "users", label: "Users", path: "/pages/admin/users" },
  ];

  // Fetch courses and users when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch courses
      const coursesResponse = await fetch("/api/admin/courses");
      if (!coursesResponse.ok) throw new Error("Failed to fetch courses");
      const coursesData = await coursesResponse.json();
      setCourses(coursesData.courses);

      // Update selected course if needed
      if (selectedCourse) {
        const updatedCourse = coursesData.courses.find(
          (course: Course) => course.id === selectedCourse.id
        );
        if (updatedCourse) {
          setSelectedCourse(updatedCourse);
        }
      }

      // Fetch users for the enrollment form
      const usersResponse = await fetch("/api/admin/users");
      if (!usersResponse.ok) throw new Error("Failed to fetch users");
      const usersData = await usersResponse.json();
      setUsers(usersData.users);
    } catch (err) {
      setError("Error loading data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create new course
  const createCourse = async (courseData: {
    name: string;
    code: string;
    description: string;
    professorId: string | null;
  }) => {
    try {
      // Validation is now handled in the CourseForm component

      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create course");
      }

      const { course } = await response.json();

      // Add new course to state
      setCourses((prevCourses) => [...prevCourses, course]);

      // Clear any previous errors
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error(err);
    }
  };

  // Enroll students in course
  const enrollStudents = async () => {
    try {
      if (!enrollmentCourse || enrollmentStudents.length === 0) {
        setError("Please select a course and at least one student");
        return;
      }

      const response = await fetch(
        `/api/admin/courses/${enrollmentCourse}/enroll`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentIds: enrollmentStudents }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enroll students");
      }

      // Refresh data to show updated enrollments
      fetchData();

      // Reset form
      setEnrollmentCourse("");
      setEnrollmentStudents([]);

      // Clear any previous errors and show success
      setError(null);
      alert("Students enrolled successfully");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error(err);
    }
  };

  // Handle multi-select for student enrollment
  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map((option) => option.value);
    setEnrollmentStudents(values);
  };

  // Handle students being removed from a course
  const handleStudentsRemoved = () => {
    fetchData();
  };

  // Handle course selection
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setShowProfessorForm(false);
    setSelectedProfessorId(course.professorId || "");
  };

  // Close course details
  const handleCloseDetails = () => {
    setSelectedCourse(null);
    setShowProfessorForm(false);
  };

  // Handle professor assignment
  const handleProfessorAssignment = async (professorId: string | null) => {
    if (!selectedCourse) return;

    try {
      setIsUpdating(true);
      setError(null);

      const response = await fetch(`/api/admin/courses/${selectedCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professorId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update professor");
      }

      // Reset form state
      setShowProfessorForm(false);
      setSelectedProfessorId("");

      // Refresh data to show updated professor
      fetchData();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex h-full bg-gray-100 flex-1 pl-44">
        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <h1 className="text-xl font-">Course Management</h1>

          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Course Creation Using CourseForm Component */}
          <CourseForm onCreateCourse={createCourse} />

          {/* Student Enrollment Section */}
          <div className="mt-6 p-6 bg-white shadow-md rounded-md border">
            <h2 className="text-xl font-semibold">Enroll Students in Course</h2>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Course
                </label>
                <select
                  value={enrollmentCourse}
                  onChange={(e) => setEnrollmentCourse(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-md"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Students (hold Ctrl/Cmd to select multiple)
                </label>
                <select
                  multiple
                  value={enrollmentStudents}
                  onChange={handleStudentSelect}
                  className="w-full mt-2 p-2 border rounded-md h-40"
                >
                  {users
                    .filter((user) => user.role === "STUDENT")
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.email})
                      </option>
                    ))}
                </select>
              </div>
              <button
                onClick={enrollStudents}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700"
              >
                Enroll Students
              </button>
            </div>
          </div>

          {/* Course List and Details Section */}
          <div className="mt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Course List */}
              <div className="w-full md:w-1/2 bg-white p-6 shadow-md rounded-md border">
                <h3 className="text-xl font-semibold mb-4">
                  Available Courses
                </h3>
                {loading ? (
                  <p className="text-gray-500 mt-2">Loading courses...</p>
                ) : (
                  <ul className="space-y-4 mt-4">
                    {courses.length === 0 ? (
                      <p className="text-gray-500">No courses available</p>
                    ) : (
                      courses.map((course) => (
                        <li
                          key={course.id}
                          onClick={() => handleCourseSelect(course)}
                          className={`p-4 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                            selectedCourse?.id === course.id
                              ? "border-2 border-blue-500"
                              : "border border-gray-200"
                          }`}
                        >
                          <h4 className="font-semibold">{course.name}</h4>
                          <p className="text-sm text-gray-700">{course.code}</p>
                          <p className="text-sm mt-1">{course.description}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Professor:{" "}
                            {course.professor ? (
                              `${course.professor.firstName} ${course.professor.lastName}`
                            ) : (
                              <span className="italic">Not assigned</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            Students:{" "}
                            {course.students ? course.students.length : 0}
                          </p>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {/* Course Details */}
              {selectedCourse && (
                <div className="w-full md:w-1/2 bg-white p-6 shadow-md rounded-md border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Course Details</h3>
                    <button
                      onClick={handleCloseDetails}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-medium">
                      {selectedCourse.name}
                    </h4>
                    <p className="text-gray-700">{selectedCourse.code}</p>
                    <p className="mt-2">{selectedCourse.description}</p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium">Professor</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        {selectedCourse.professor ? (
                          <p>
                            {selectedCourse.professor.firstName}{" "}
                            {selectedCourse.professor.lastName} (
                            {selectedCourse.professor.id})
                          </p>
                        ) : (
                          <p className="italic text-gray-500">
                            No professor assigned
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowProfessorForm(true)}
                        className="px-2 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                      >
                        {selectedCourse.professor ? "Change" : "Assign"}{" "}
                        Professor
                      </button>
                    </div>

                    {showProfessorForm && (
                      <div className="mt-3 p-3 border rounded-md bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-sm font-medium">
                            {selectedCourse.professor ? "Change" : "Assign"}{" "}
                            Professor
                          </h5>
                          <button
                            onClick={() => setShowProfessorForm(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="mb-2">
                          <select
                            value={selectedProfessorId}
                            onChange={(e) =>
                              setSelectedProfessorId(e.target.value)
                            }
                            className="w-full p-2 border rounded-md text-sm"
                          >
                            <option value="">-- Select a professor --</option>
                            {users
                              .filter((user) => user.role === "PROFESSOR")
                              .map((professor) => (
                                <option key={professor.id} value={professor.id}>
                                  {professor.firstName} {professor.lastName} (
                                  {professor.email})
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="flex justify-end space-x-2">
                          {selectedCourse.professor && (
                            <button
                              onClick={() => handleProfessorAssignment(null)}
                              className="px-2 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                              disabled={isUpdating}
                            >
                              Remove Professor
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleProfessorAssignment(selectedProfessorId)
                            }
                            className="px-2 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                            disabled={isUpdating || !selectedProfessorId}
                          >
                            {isUpdating ? "Updating..." : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enrolled Students List Component */}
                  <EnrolledStudentsList
                    courseId={selectedCourse.id}
                    students={selectedCourse.students}
                    onStudentsRemoved={handleStudentsRemoved}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCoursesPage;
