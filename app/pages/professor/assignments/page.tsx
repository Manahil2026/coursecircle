"use client";
import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface Assignment {
  title: string;
  points: string;
  dueDate: string;
  dueTime: string;
}

interface Group {
  name: string;
  assignments: Assignment[];
}

const ProfessorAssignments = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editGroupIndex, setEditGroupIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);
  const [newAssignment, setNewAssignment] = useState<Assignment>({
    title: "",
    points: "",
    dueDate: "",
    dueTime: "",
  });

  const handleNavigate = () => {
    router.push(`/pages/professor/view_assignment`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAssignment((prev) => ({ ...prev, [name]: value }));
  };

  const handlePublish = () => {
    if (!newAssignment.title.trim()) {
      alert("Please provide a title.");
      return;
    }

    const updatedGroups = [...groups];

    if (selectedGroupIndex !== null) {
      updatedGroups[selectedGroupIndex].assignments.push(newAssignment);
    } else {
      let ungroupedIndex = updatedGroups.findIndex(group => group.name === "Ungrouped");

      if (ungroupedIndex === -1) {
        updatedGroups.push({ name: "Ungrouped", assignments: [newAssignment] });
      } else {
        updatedGroups[ungroupedIndex].assignments.push(newAssignment);
      }
    }

    setGroups(updatedGroups);
    setShowModal(false);
    setNewAssignment({ title: "", points: "", dueDate: "", dueTime: "" });
    setEditIndex(null);
    setSelectedGroupIndex(null); // Reset selected group
  };


  const handleDeleteGroup = (groupIndex: number) => {
    if (groups[groupIndex].assignments.length > 0) {
      alert("You can't delete a group that contains assignments.");
      return;
    }

    if (confirm("Are you sure you want to delete this group?")) {
      const updatedGroups = [...groups];
      updatedGroups.splice(groupIndex, 1);
      setGroups(updatedGroups);
    }
  };

  const handleEditGroup = (groupIndex: number) => {
    setNewGroupName(groups[groupIndex].name);
    setEditGroupIndex(groupIndex);
    setShowGroupModal(true);
  };

  const handleSaveGroup = () => {
    if (!newGroupName.trim()) return;

    const updatedGroups = [...groups];

    if (editGroupIndex !== null) {
      updatedGroups[editGroupIndex].name = newGroupName;
      setEditGroupIndex(null);
    } else {
      updatedGroups.push({ name: newGroupName, assignments: [] });
    }

    setGroups(updatedGroups);
    setNewGroupName("");
    setShowGroupModal(false);
  };

  const handleDelete = (groupIndex: number, index: number) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      const updatedGroups = [...groups];
      updatedGroups[groupIndex].assignments.splice(index, 1);
      setGroups(updatedGroups);
    }
  };

  const handleEdit = (groupIndex: number, index: number) => {
    setNewAssignment(groups[groupIndex].assignments[index]);
    setEditGroupIndex(groupIndex);
    setEditIndex(index);
    setShowModal(true);
  };

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu />
      <div className="flex-1 p-6 ml-48">
        <div className="relative mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGroupModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Group
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#AAFF45] text-black px-4 py-2 rounded hover:bg-[#B9FF66]"
            >
              Create Assignment
            </button>
          </div>
        </div>

        {/* Groups and Assignments List */}
        <div className="mt-6">
          {groups.length === 0 ? (
            <p>No assignment groups yet.</p>
          ) : (
            groups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4 border rounded shadow p-3">
                <details>
                  <summary className="font-semibold text-lg flex items-center cursor-pointer">
                    <span className="flex-1">{group.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditGroup(groupIndex)}
                        className="bg-black text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(groupIndex)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </summary>

                  <ul className="mt-2">
                    {group.assignments.map((assignment, index) => (
                      <li key={index} className="border p-3 mb-2 shadow rounded flex justify-between items-center hover:bg-slate-100">
                        <div>
                          <p
                            className="font-semibold text-black hover:underline cursor-pointer"
                            onClick={handleNavigate}
                          >
                            {assignment.title}
                          </p>
                          <p>Points: {assignment.points}</p>
                          <p>Due Date: {assignment.dueDate} at {assignment.dueTime}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(groupIndex, index)}
                            className="bg-black text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(groupIndex, index)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            ))
          )}
        </div>

        {/* Create/Edit Assignment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">{editIndex !== null ? "Edit" : "Create"} Assignment</h2>
              <select
                className="w-full border p-2 rounded mb-2"
                onChange={(e) => setSelectedGroupIndex(Number(e.target.value))}
              >
                <option value="">Select Group</option>
                {groups.map((group, index) => (
                  <option key={index} value={index}>{group.name}</option>
                ))}
              </select>
              <input type="text" name="title" value={newAssignment.title} onChange={handleChange} placeholder="Title" className="w-full border p-2 rounded mb-2" />
              <input type="text" name="points" value={newAssignment.points} onChange={handleChange} placeholder="Points" className="w-full border p-2 rounded mb-2" />
              <input type="date" name="dueDate" value={newAssignment.dueDate} onChange={handleChange} className="w-full border p-2 rounded mb-2" />
              <input type="time" name="dueTime" value={newAssignment.dueTime} onChange={handleChange} className="w-full border p-2 rounded mb-4" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                <button onClick={handlePublish} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{editIndex !== null ? "Save" : "Create"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Group Modal */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">
                {editGroupIndex !== null ? "Edit Group" : "Create Group"}
              </h2>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group Name"
                className="w-full border p-2 rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowGroupModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                <button onClick={handleSaveGroup} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  {editGroupIndex !== null ? "Save" : "Add"}
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
