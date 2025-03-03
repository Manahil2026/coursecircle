"use client";
import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null
  );
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
      let ungroupedIndex = updatedGroups.findIndex(
        (group) => group.name === "Ungrouped"
      );

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
      <div className="flex-1 pl-52 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-base font-medium">Assignments</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGroupModal(true)}
              className="p-2 mt-2 bg-[#AAFF45] text-black text-sm rounded-sm hover:bg-[#B9FF66]"
            >
              Add Group
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="p-2 mt-2 bg-[#AAFF45] text-black text-sm rounded-sm hover:bg-[#B9FF66]"
            >
              Create Assignment
            </button>
          </div>
        </div>

        {/* Groups and Assignments List */}
        <div className="mt-2">
          {groups.length === 0 ? (
            <p>No assignment groups yet.</p>
          ) : (
            groups.map((group, groupIndex) => (
              <div key={groupIndex} className="border border-gray-400 rounded-sm p-2 mb-4">
                <details>
                  <summary className="text-base flex items-center cursor-pointer">
                    <span className="flex-1">{group.name}</span>
                    <div className="flex gap-4">
                      <button onClick={() => handleEditGroup(groupIndex)}>
                        <Image
                          src="/asset/edit_icon.svg"
                          alt="Delete"
                          width={18}
                          height={18}
                        />
                      </button>
                      <button onClick={() => handleDeleteGroup(groupIndex)}>
                        <Image
                          src="/asset/delete_icon.svg"
                          alt="Delete"
                          width={18}
                          height={18}
                        />
                      </button>
                    </div>
                  </summary>

                  <ul className="mt-2">
                    {group.assignments.map((assignment, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center bg-gray-200"
                      >
                        <div>
                          <p
                            className="font-base text-black hover:underline cursor-pointer py-2"
                            onClick={handleNavigate}
                          >
                            {assignment.title} - due: {assignment.dueDate} at{" "}
                            {assignment.dueTime} - {assignment.points} PTS
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={() => handleEdit(groupIndex, index)}>
                            <Image
                              src="/asset/edit_icon.svg"
                              alt="Delete"
                              width={18}
                              height={18}
                            />
                          </button>
                          <button
                            onClick={() => handleDelete(groupIndex, index)}
                          >
                            <Image
                              src="/asset/delete_icon.svg"
                              alt="Delete"
                              width={18}
                              height={18}
                            />
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
              <h2 className="text-xl font-bold mb-4">
                {editIndex !== null ? "Edit" : "Create"} Assignment
              </h2>
              <select
                className="w-full border p-2 rounded mb-2"
                onChange={(e) => setSelectedGroupIndex(Number(e.target.value))}
              >
                <option value="">Select Group</option>
                {groups.map((group, index) => (
                  <option key={index} value={index}>
                    {group.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="title"
                value={newAssignment.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full border p-2 rounded mb-2"
              />
              <input
                type="text"
                name="points"
                value={newAssignment.points}
                onChange={handleChange}
                placeholder="Points"
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
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {editIndex !== null ? "Save" : "Create"}
                </button>
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
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGroup}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
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
