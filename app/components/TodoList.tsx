"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Task {
  id: string;
  text: string;
  due: string;
  date: string;
}

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [showInputForm, setShowInputForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch existing todos on mount
  useEffect(() => {
    fetch("/api/todo")
      .then((res) => res.json())
      .then((data: Array<{
        id: string;
        content: string;
        dueDate: string | null;
        dueTime: string | null;
      }>) => {
        const mapped = data.map((t) => {
          const dateDisplay = t.dueDate
            ? new Date(t.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "Today";
          return {
            id: t.id,
            text: t.content,
            due: t.dueTime ? formatTime(t.dueTime) : formatTime("11:55"),
            date: dateDisplay,
          };
        });
        setTasks(mapped);
      });
  }, []);

  const resetForm = () => {
    setNewTaskText("");
    setNewTaskDue("");
    setNewTaskDate("");
    setShowInputForm(false);
    setEditingTask(null);
  };

  const formatTime = (time24: string) => { // To display time in 12-hour format
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };
  

  const addTask = async () => {
    if (!newTaskText.trim()) return;

    // call API
    const payload = {
      content: newTaskText,
      dueDate: newTaskDate || null,
      dueTime: newTaskDue || null,
    };
    const res = await fetch("/api/todo", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const created = await res.json();

    // map returned todo
    const dateDisplay = created.dueDate
      ? new Date(created.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Today";
    const newTask: Task = {
      id: created.id,
      text: created.content,
      due: created.dueTime
       ? formatTime(created.dueTime)
       : formatTime("11:55"),
      date: dateDisplay,
    };

    setTasks((prev) => [newTask, ...prev]);
    resetForm();
  };

  const updateTask = async () => {
    if (!editingTask) return;

    const payload = {
      id: editingTask.id,
      content: newTaskText,
      dueDate: newTaskDate || null,
      dueTime: newTaskDue || null,
    };
    const res = await fetch("/api/todo", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const updated = await res.json();

    const dateDisplay = updated.dueDate
      ? new Date(updated.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Today";

    setTasks((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? {
              id: updated.id,
              text: updated.content,
              due: updated.dueTime
                ? formatTime(updated.dueTime)
                : t.due,
              date: dateDisplay,
            }
          : t
      )
    );
    resetForm();
  };

  const handleSave = () => {
    if (editingTask) return updateTask();
    return addTask();
  };

  const removeTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch("/api/todo", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setNewTaskText(task.text);
    setNewTaskDue(task.due);
    // parse back to yyyy-MM-dd for the date input
    const today = new Date();
    const [mon, day] = task.date.split(" ");
    // you might skip this fallback logic if users only pick custom dates
    setNewTaskDate(
      mon && day
        ? new Date(`${mon} ${day}, ${today.getFullYear()}`)
            .toISOString()
            .slice(0, 10)
        : ""
    );
    setShowInputForm(true);
  };

  const cancelEdit = () => resetForm();

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold">To-do List</h2>
        <button onClick={() => setShowInputForm(true)}>
          <Image
            src="/asset/add_icon.svg"
            alt="Add icon"
            width={27}
            height={27}
            priority
          />
        </button>
      </div>

      <div className="bg-white p-2 rounded-lg space-y-2">
        {showInputForm && (
          <div className="flex flex-col gap-2 mb-4">
            <input
              type="text"
              placeholder="Task description"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="border p-2 rounded flex-grow"
              />
              <input
                type="time"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                className="border p-2 rounded w-28"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-black text-white px-3 py-1 rounded text-sm"
              >
                {editingTask ? "Update" : "Add"}
              </button>
              <button
                onClick={cancelEdit}
                className="bg-gray-300 px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">
            No tasks yet. Add one above!
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task, index) => (
              <li
                key={task.id}
                onClick={() => startEdit(task)}
                className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-300 hover:transform hover:scale-105 flex justify-between items-center ${
                  index === 0 ? "bg-black text-white" : "bg-white"
                }`}
              >
                <div>
                  <span className="font-medium">{task.date}</span> |{" "}
                  {task.text} (Due {task.due})
                </div>
                <button
                  onClick={(e) => removeTask(task.id, e)}
                  className="text-sm ml-4"
                >
                  {index === 0 ? (
                    <div className="invert">
                      <Image
                        src="/asset/delete_icon.svg"
                        alt="Delete"
                        width={20}
                        height={20}
                        priority
                      />
                    </div>
                  ) : (
                    <Image
                      src="/asset/delete_icon.svg"
                      alt="Delete"
                      width={20}
                      height={20}
                      priority
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
