"use client";
import React, { useState } from "react";
import Image from "next/image";

interface Task {
  id: number;
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

  const addTask = () => {
    if (!newTaskText.trim()) return;

    let dateDisplay = "Today";
    
    // Format the selected date if provided
    if (newTaskDate) {
      const selectedDate = new Date(newTaskDate);
      dateDisplay = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { 
              ...task, 
              text: newTaskText, 
              due: newTaskDue || task.due,
              date: newTaskDate ? dateDisplay : task.date
            } 
          : task
      ));
      setEditingTask(null);
    } else {
      // Add new task
      const newTask: Task = {
        id: Date.now(),
        text: newTaskText,
        due: newTaskDue || "11:55",
        date: dateDisplay,
      };
      setTasks((prev) => [...prev, newTask]);
    }
    
    setNewTaskText("");
    setNewTaskDue("");
    setNewTaskDate("");
    setShowInputForm(false);
  };

  const removeTask = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setNewTaskText(task.text);
    setNewTaskDue(task.due);
    setShowInputForm(true);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setNewTaskText("");
    setNewTaskDue("");
    setNewTaskDate("");
    setShowInputForm(false);
  };

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
                onClick={addTask}
                className="bg-black text-white px-3 py-1 rounded text-sm"
              >
                {editingTask ? 'Update' : 'Add'}
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
                  <span className="font-medium">{task.date}</span> | {task.text} (Due {task.due})
                </div>
                <button
                  onClick={(e) => removeTask(task.id, e)}
                  className="text-sm ml-4"
                >
                  {index === 0 ? (
                    // White delete icon for first task with black background
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
                    // Regular delete icon for other tasks
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