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
  published: boolean;
}

interface Group {
  id: string;
  name: string;
  assignments: Assignment[];
  weight: number;
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
  const [isLoading, setIsLoading] = useState(true);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [groupWeights, setGroupWeights] = useState<{ id: string; name: string; weight: number }[]>([]);

  const courseId = params?.courseId as string; // Extract courseId from URL

  useEffect(() => {
    if (courseId) {
      setIsLoading(true);
      fetch(`/api/courses/${courseId}/assignments`)
        .then((res) => res.json())
        .then((data) => {
          setGroups(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching assignments:", error);
          setIsLoading(false);
        });
    }
  }, [courseId]);

  useEffect(() => {
    setGroupWeights(groups.map((g) => ({ id: g.id, name: g.name, weight: g.weight || 0 })));
  }, [groups]);

  const [newAssignment, setNewAssignment] = useState<Assignment>({
    id: "",
    title: "",
    points: "",
    dueDate: "",
    dueTime: "",
    published: false,
  });

  const handleNavigate = (assignmentId: string) => {
    router.push(`/pages/professor/assignments/${courseId}/${assignmentId}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAssignment((prev) => ({ ...prev, [name]: value }));
  };

  const fetchAssignments = async () => {
    if (courseId) {
      const res = await fetch(`/api/courses/${courseId}/assignments`);
      const updatedGroups = await res.json();
      setGroups(updatedGroups);
    }
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
      await fetchAssignments();
    } catch (error) {
      console.error("Error creating group:", error);
      alert("An error occurred while creating the group.");
    }
  };

  const handleSave = async () => {
    if (!newAssignment.title.trim()) {
      alert("Title is mandatory.");
      return;
    }
  
    if (!newAssignment.points.trim()) {
      alert("Points are mandatory.");
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
      dueDate: newAssignment.dueDate || "", // Optional
      dueTime: newAssignment.dueTime || "", // Optional
      groupId,
      assignmentId,
    };
  
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
              weight: 0,
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

  const handleEdit = (groupIndex: number, index: number) => { //edit assignment
    const assignment = groups[groupIndex].assignments[index];
    const dt = assignment.dueDate ? new Date(assignment.dueDate) : null;

    setNewAssignment({
      id: assignment.id,
      title: assignment.title,
      points: assignment.points,
      dueDate: assignment.dueDate ? dt!.toISOString().split("T")[0] : "",
      dueTime: dt
        ? `${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`
        : "",
      published: assignment.published,
    });

    setEditGroupIndex(groupIndex);
    setEditIndex(index);
    setSelectedGroupIndex(groupIndex);
    setShowModal(true);
  };


  const convertTo12HourFormat = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for AM
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const handlePublishAssignment = async (groupIndex: number, index: number) => {
    const assignment = groups[groupIndex].assignments[index];
    const confirmPublish = confirm("Are you sure you want to publish this assignment?");
    if (!confirmPublish) return;

    try {
      const payload = { published: true };
      const res = await fetch(`/api/courses/${courseId}/assignments/${assignment.id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Assignment published successfully!");
        // Update the local state to reflect the change
        setGroups(prev =>
          prev.map((group, gIndex) => {
            if (gIndex === groupIndex) {
              const updatedAssignments = group.assignments.map((a, aIndex) =>
                aIndex === index ? { ...a, published: true } : a
              );
              return { ...group, assignments: updatedAssignments };
            }
            return group;
          })
        );
      } else {
        const errorData = await res.json();
        alert(`Failed to publish assignment: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error publishing assignment:", error);
      alert("An error occurred while publishing the assignment.");
    }
  };

  const handleUnpublishAssignment = async (groupIndex: number, index: number) => {
    const assignment = groups[groupIndex].assignments[index];
    const confirmUnpublish = confirm("Are you sure you want to unpublish this assignment?");
    if (!confirmUnpublish) return;

    try {
      const payload = { published: false };
      const res = await fetch(`/api/courses/${courseId}/assignments/${assignment.id}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Assignment unpublished successfully!");
        setGroups(prev =>
          prev.map((group, gIndex) => {
            if (gIndex === groupIndex) {
              const updatedAssignments = group.assignments.map((a, aIndex) =>
                aIndex === index ? { ...a, published: false } : a
              );
              return { ...group, assignments: updatedAssignments };
            }
            return group;
          })
        );
      } else {
        const errorData = await res.json();
        alert(`Failed to unpublish assignment: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error unpublishing assignment:", error);
      alert("An error occurred while unpublishing the assignment.");
    }
  };

  const handleWeightChange = (groupId: string, newWeight: number) => {
    setGroupWeights((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, weight: newWeight } : g))
    );
  };
  
  const handleSaveWeights = async () => {
    try {
      const payload = groupWeights.map(({ id, weight }) => ({ groupId: id, weight })); // Exclude 'name'
      console.log("Weights payload:", payload); // Debug log
  
      const res = await fetch(`/api/courses/${courseId}/groups/weights`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights: payload }),
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Failed to save weights: ${errorData.error || "Unknown error"}`);
        return;
      }
  
      alert("Weights saved successfully!");
      setShowWeightModal(false);
    } catch (error) {
      console.error("Error saving weights:", error);
      alert("An error occurred while saving weights.");
    }
  };

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <CourseMenu
        courseId={courseId}
      />
      <div className="flex-1 pl-52 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-medium">Assignments</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setNewGroupName("");
                setEditGroupIndex(null);
                setShowGroupModal(true);
              }}
              className="p-2 mt-2 bg-[#AAFF45] text-black text-sm rounded hover:bg-[#B9FF66]"
            >
              Add Group
            </button>
            <button
              onClick={() => {
                setNewAssignment({ id: "", title: "", points: "", dueDate: "", dueTime: "", published: false }); // Reset form
                setEditIndex(null); // Ensure it's not in edit mode
                setEditGroupIndex(null);
                setSelectedGroupIndex(null);
                setShowModal(true);
              }}
              className="p-2 mt-2 bg-[#AAFF45] text-black text-sm rounded hover:bg-[#B9FF66]"
            >
              Create Assignment
            </button>
            <button
              onClick={() => setShowWeightModal(true)}
              className="p-2 mt-2 bg-[#AAFF45] text-black text-sm rounded hover:bg-[#B9FF66]"
            >
              ⋮
            </button>
          </div>
        </div>

        {/* Loading screen */}
        {isLoading ? (
          <div className="fixed inset-0 flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
          </div>
        ) : (
          // Groups and Assignments List
          <div className="w-full mt-4">
            {groups.length === 0 ? (
              <p>No assignment groups yet.</p>
            ) : (
              groups.map((group, groupIndex) => (
              <div key={group.id} className="mb-6 text-sm">
                <div className="bg-[#AAFF45] border border-gray-400 p-2 rounded-t-sm flex justify-between items-center">
                <span>{group.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditGroup(groupIndex)}>
                  <Image src="/asset/edit_icon.svg" alt="Edit" width={18} height={18} />
                  </button>
                  <button onClick={() => handleDeleteGroup(groupIndex)}>
                  <Image src="/asset/delete_icon.svg" alt="Delete" width={18} height={18} />
                  </button>
                </div>
                </div>

                {/* Assignments */}
                {(group.assignments || []).map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="border border-gray-400 border-t-0 rounded-sm"
                >
                  <div className="flex justify-between items-center p-2">
                  <div>
                    <p
                    className="text-sm font-semibold text-gray-800 hover:underline cursor-pointer"
                    onClick={() => handleNavigate(assignment.id)}
                    >
                    {assignment.title}
                    </p>
                    <div className="text-xs text-gray-600">
                      <b>Due</b>:{" "}
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}{" "}
                      at{" "}
                      {assignment.dueDate
                        ? (() => {
                            const dt = new Date(assignment.dueDate);
                            const hh = dt.getHours().toString().padStart(2, "0");
                            const mm = dt.getMinutes().toString().padStart(2, "0");
                            return convertTo12HourFormat(`${hh}:${mm}`);
                          })()
                        : "N/A"}{" "}
                      - {assignment.points} pts
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {assignment.published ? (
                    <div className="relative group flex items-center">
                      <button onClick={() => handleUnpublishAssignment(groupIndex, index)}>
                      <Image
                        src="/asset/publish_icon.svg"
                        alt="Published"
                        width={19}
                        height={19}
                        className="cursor-pointer"
                      />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100">
                      Unpublish
                      </span>
                    </div>
                    ) : (
                    <div className="relative group flex items-center">
                      <button onClick={() => handlePublishAssignment(groupIndex, index)}>
                      <Image
                        src="/asset/unpublish_icon.svg"
                        alt="Unpublished"
                        width={18}
                        height={18}
                        className="cursor-pointer"
                      />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100">
                      Publish
                      </span>
                    </div>
                    )}
                    <button onClick={() => handleEdit(groupIndex, index)}>
                    <Image src="/asset/edit_icon.svg" alt="Edit" width={18} height={18} />
                    </button>
                    <button onClick={() => handleDelete(groupIndex, index)}>
                    <Image src="/asset/delete_icon.svg" alt="Delete" width={18} height={18} />
                    </button>
                  </div>
                  </div>
                </div>
                ))}

                {/* Empty bottom border for the last item */}
                <div className="border-t-0 rounded-b-sm h-1"></div>
              </div>
              ))
            )}
            </div>
        )}


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
                value={newAssignment.dueDate} // Ensure it's always controlled
                onChange={handleChange}
                className="w-full border p-2 rounded mb-2"
              />
              <input
                type="time"
                name="dueTime"
                value={newAssignment.dueTime} // Ensure it's always controlled
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
                  onClick={handleSave}
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

        {showWeightModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Set Group Weights</h2>
              {groupWeights.map((group) => (
                <div key={group.id} className="mb-2">
                  <label className="block text-sm font-medium">{group.name}</label>
                  <input
                    type="number"
                    value={group.weight}
                    onChange={(e) => handleWeightChange(group.id, Number(e.target.value))}
                    className="w-full border p-2 rounded"
                  />
                </div>
              ))}
              <p className="text-right font-bold">
                Total Weight: {groupWeights.reduce((sum, g) => sum + g.weight, 0)}%
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWeights}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
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
