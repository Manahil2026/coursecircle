"use client";
import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import React, { useState } from "react";

interface Assignment {
  title: string;
  points: string;
  dueDate: string;
  dueTime: string;
}

const ProfessorAssignments = () => {
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newAssignment, setNewAssignment] = useState<Assignment>({
    title: "",
    points: "",
    dueDate: "",
    dueTime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAssignment((prev) => ({ ...prev, [name]: value }));
  };

  const handlePublish = () => {
    if (!newAssignment.title || !newAssignment.points || !newAssignment.dueDate || !newAssignment.dueTime) {
      alert("Please fill in all fields");
      return;
    }
    if (editIndex !== null) {
      const updatedAssignments = [...assignments];
      updatedAssignments[editIndex] = newAssignment;
      setAssignments(updatedAssignments);
      setEditIndex(null);
    } else {
      setAssignments([...assignments, newAssignment]);
    }
    setShowModal(false);
    setNewAssignment({ title: "", points: "", dueDate: "", dueTime: "" });
  };

  const handleDelete = (index: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");
    if (confirmDelete) {
      setAssignments(assignments.filter((_, i) => i !== index));
    }
  };

  const handleEdit = (index: number) => {
    setNewAssignment(assignments[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu />
      <div className="flex-1 p-6 ml-48">
        <div className="relative mb-4">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <button
            onClick={() => setShowModal(true)}
            className="absolute top-0 right-0 bg-[#AAFF45] text-black px-4 py-2 rounded hover:bg-[#B9FF66]"
          >
            Create Assignment
          </button>
        </div>

        {/* Assignments List */}
        <div className="mt-6">
          {assignments.length === 0 ? (
            <p>No assignments yet.</p>
          ) : (
            <ul>
              {assignments.map((assignment, index) => (
                <li key={index} className="border p-3 mb-2 shadow rounded flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold">{assignment.title}</h2>
                    <p>Points: {assignment.points}</p>
                    <p>Due Date: {assignment.dueDate} at {assignment.dueTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="bg-black text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Create/Edit Assignment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">{editIndex !== null ? "Edit Assignment" : "Create Assignment"}</h2>
              <input
                type="text"
                name="title"
                value={newAssignment.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full border p-2 rounded mb-2"
              />
              <input
                type="number"
                name="points"
                value={newAssignment.points}
                onChange={handleChange}
                placeholder="Total Points"
                className="w-full border p-2 rounded mb-2"
              />
              <input
                type="date"
                name="dueDate"
                value={newAssignment.dueDate}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-2"
              />
              <input
                type="time"
                name="dueTime"
                value={newAssignment.dueTime}
                onChange={handleChange}
                className="w-full border p-2 rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="bg-gray-300 px-4 py-2 rounded">
                  Cancel
                </button>
                <button onClick={handlePublish} className="bg-[#AAFF45] text-black px-4 py-2 rounded hover:bg-[#B9FF66]">
                  {editIndex !== null ? "Save Changes" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorAssignments;
