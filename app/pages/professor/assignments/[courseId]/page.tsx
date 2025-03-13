"use client";
import CourseMenu from "@/app/components/course_menu";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

interface Assignment {
  id: string;
  title: string;
  points: string;
  dueDate: string;
  dueTime: string;
}

interface Group {
  id: string;
  name: string;
  assignments: Assignment[];
}

const ProfessorAssignments = () => {
  const router = useRouter();
  const params = useParams();
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editGroupIndex, setEditGroupIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);

  const courseId = params?.courseId as string; // Extract courseId from URL

  useEffect(() => {
    if (courseId) {
      fetch(`/api/courses/${courseId}/assignments`)
        .then((res) => res.json())
        .then(setGroups);
    }
  }, [courseId]);


  const [newAssignment, setNewAssignment] = useState<Assignment>({
    id: "",
    title: "",
    points: "",
    dueDate: "",
    dueTime: "",
  });

  const handleNavigate = () => {
    router.push(`/pages/professor/view_assignment`); // change later
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAssignment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveGroup = async () => { // add group
    if (!newGroupName.trim()) return;

    // Check if a group with the same name already exists (case-insensitive)
    const groupExists = groups.some(
      (group) => group.name.toLowerCase() === newGroupName.toLowerCase()
    );

    if (groupExists) {
      alert("A group with this name already exists in this course.");
      return;
    }

    try {
      const res = await fetch(`/api/courses/${courseId}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName,
          groupId: editGroupIndex !== null ? groups[editGroupIndex].id : null,
          courseId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        alert(`Failed to create group: ${errorData.message || "Unknown error"}`);
        return;
      }

      const updatedGroup = await res.json();
      console.log("Created group:", updatedGroup);

      setGroups((prev) =>
        editGroupIndex !== null
          ? prev.map((g, i) => (i === editGroupIndex ? updatedGroup : g))
          : [...prev, updatedGroup]
      );

      setShowGroupModal(false);
    } catch (error) {
      console.error("Error creating group:", error);
      alert("An error occurred while creating the group.");
    }
  };

  const handlePublish = async () => {
    if (!newAssignment.title.trim()) {
      alert("Please provide a title.");
      return;
    }

    const groupId = selectedGroupIndex !== null ? groups[selectedGroupIndex].id : null;
    const assignmentId =
      editGroupIndex !== null && editIndex !== null
        ? groups[editGroupIndex].assignments[editIndex].id
        : null;

    const payload = {
      title: newAssignment.title,
      points: newAssignment.points,
      dueDate: newAssignment.dueDate,
      dueTime: newAssignment.dueTime,
      groupId,
      assignmentId,
    };

    console.log("Sending payload:", JSON.stringify(payload)); // Debugging

    try {
      const res = await fetch(`/api/courses/${courseId}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        alert(`Failed to create assignment: ${errorData.error || "Unknown error"}`);
        return;
      }

      const updatedAssignment = await res.json();
      console.log("Created assignment:", updatedAssignment);

      setGroups((prev) => {
        const updatedGroups = prev.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              assignments: editIndex !== null
                ? group.assignments.map((a, i) => (i === editIndex ? updatedAssignment : a))
                : [...group.assignments, updatedAssignment], // Append only if it's a new assignment
            };
          }
          return group;
        });

        // If the assignment is ungrouped, handle it separately
        if (!groupId) {
          return [
            ...updatedGroups,
            {
              id: "ungrouped",
              name: "Ungrouped",
              assignments: [updatedAssignment], // Only one instance should be added
            },
          ];
        }

        return updatedGroups;
      });

      setShowModal(false);
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("An error occurred while creating the assignment.");
    }
  };

  const handleDeleteGroup = async (groupIndex: number) => { // delete group
    const groupId = groups[groupIndex].id;
    if (groups[groupIndex].assignments.length > 0) {
      alert("You can't delete a group that contains assignments.");
      return;
    }

    if (confirm("Are you sure you want to delete this group?")) {
      await fetch(`/api/courses/${courseId}/groups`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      setGroups((prev) => prev.filter((_, i) => i !== groupIndex));
    }
  };

  const handleDelete = async (groupIndex: number, index: number) => { // delete assignment
    const assignmentId = groups[groupIndex].assignments[index].id;
    if (confirm("Are you sure you want to delete this assignment?")) {
      await fetch(`/api/courses/${courseId}/assignments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
      });

      setGroups((prev) => {
        const updatedGroups = [...prev];
        updatedGroups[groupIndex].assignments.splice(index, 1);
        return updatedGroups;
      });
    }
  };

  const handleEditGroup = (groupIndex: number) => { // edit group name
    setNewGroupName(groups[groupIndex].name);
    setEditGroupIndex(groupIndex);
    setShowGroupModal(true);
  };


  const handleEdit = (groupIndex: number, index: number) => { // edit assignment details
    setNewAssignment(groups[groupIndex].assignments[index]);
    setEditGroupIndex(groupIndex);
    setEditIndex(index);
    setSelectedGroupIndex(groupIndex); // Preserve the group selection
    setShowModal(true);
  };

  const convertTo12HourFormat = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for AM
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu
        courseId={courseId}
      />
      <div className="flex-1 pl-52 px-6">
        <div className="flex justify-between items-center py-2">
          <h1 className="text-lg font-medium">Assignments</h1>
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
              <div key={groupIndex} className="border border-gray-400 rounded-md p-4 mb-4 bg-gray-200">
                <details>
                  <summary className="text-lg font-bold flex items-center cursor-pointer">
                    <span className="flex-1">{group.name}</span>
                    <div className="flex gap-4">
                      <button onClick={() => handleEditGroup(groupIndex)}>
                        <Image src="/asset/edit_icon.svg" alt="Edit" width={18} height={18} />
                      </button>
                      <button onClick={() => handleDeleteGroup(groupIndex)}>
                        <Image src="/asset/delete_icon.svg" alt="Delete" width={18} height={18} />
                      </button>
                    </div>
                  </summary>

                  <ul className="mt-2">
                    {(group.assignments ?? []).map((assignment, index) => (
                      <li key={index} className="flex justify-between items-center border-b border-gray-300 py-2 bg-white p-2 rounded-md">
                        <div>
                          <p className="text-lg font-bold text-black hover:underline cursor-pointer py-1" onClick={handleNavigate}>
                            {assignment.title}
                          </p>
                          <div className="text-sm text-gray-600">
                            <b>Due</b>: {new Date(assignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}{" "}
                            at {convertTo12HourFormat(assignment.dueTime)} - {assignment.points} pts
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button onClick={() => handleEdit(groupIndex, index)}>
                            <Image src="/asset/edit_icon.svg" alt="Edit" width={18} height={18} />
                          </button>
                          <button onClick={() => handleDelete(groupIndex, index)}>
                            <Image src="/asset/delete_icon.svg" alt="Delete" width={18} height={18} />
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
                value={newAssignment.dueDate || ""} // Ensure it's always controlled
                onChange={handleChange}
                className="w-full border p-2 rounded mb-2"
              />
              <input
                type="time"
                name="dueTime"
                value={newAssignment.dueTime || ""} // Prevents uncontrolled state
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
