"use client";

import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";
import ReactQuillEditor from "@/app/components/text_editor";
import "react-quill-new/dist/quill.snow.css";
import { useRouter } from "next/navigation";

const Coursepage: React.FC = () => {
  const [showTextInput, setShowTextInput] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [publishedTexts, setPublishedTexts] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  const [showModulePopup, setShowModulePopup] = useState(false);
  const [modules, setModules] = useState<{ title: string; description: string; file: File | null }[]>([]);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
  const [editingModule, setEditingModule] = useState<{ title: string; description: string; file: File | null }>({
    title: "",
    description: "",
    file: null,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ type: "text" | "module"; index: number } | null>(null);

  const router = useRouter();

  const handlePublishText = () => {
    if (textContent.trim()) {
      setPublishedTexts([...publishedTexts, textContent]);
      setTextContent("");
      setShowTextInput(false);
    }
  };

  const handleDeleteText = (index: number) => {
    setDeleteConfirmation({ type: "text", index });
  };

  const handleEditText = (index: number) => {
    setEditingIndex(index);
    setEditingText(publishedTexts[index]);
  };

  const handleSaveEdit = (index: number) => {
    const updatedTexts = [...publishedTexts];
    updatedTexts[index] = editingText;
    setPublishedTexts(updatedTexts);
    setEditingIndex(null);
  };

  const handleAddModule = (title: string, description: string, file: File | null) => {
    setModules([...modules, { title, description, file }]);
    setShowModulePopup(false);
  };

  const handleDeleteModule = (index: number) => {
    setDeleteConfirmation({ type: "module", index });
  };

  const handleEditModule = (index: number) => {
    setEditingModuleIndex(index);
    setEditingModule(modules[index]);
  };

  const confirmDelete = () => {
    if (deleteConfirmation) {
      if (deleteConfirmation.type === "text") {
        setPublishedTexts(publishedTexts.filter((_, i) => i !== deleteConfirmation.index));
      } else if (deleteConfirmation.type === "module") {
        setModules(modules.filter((_, i) => i !== deleteConfirmation.index));
      }
      setDeleteConfirmation(null);
    }
  };

  const handleSaveModuleEdit = (index: number) => {
    const updatedModules = [...modules];
    updatedModules[index] = {
      ...updatedModules[index],
      title: editingModule.title,
      description: editingModule.description,
      file: editingModule.file || updatedModules[index].file, // Keep old file if no new one is uploaded
    };
    setModules(updatedModules);
    setEditingModuleIndex(null);
  };

  const handleOpenFile = (file: File | null) => {
    if (!file) return;
    const fileUrl = URL.createObjectURL(file);
    router.push(`/pages/professor/view_file?file=${encodeURIComponent(fileUrl)}`);
  };

  return (
    <>
      <Sidebar_dashboard />
      <div className="flex min-h-screen bg-gray-100 flex-1 pl-52">
        <CourseMenu />

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h1 className="text-base font-medium">Professor Homepage</h1>

            <div className="flex gap-2 m-2">
              <button onClick={() => setShowTextInput(true)} className="p-2 bg-[#AAFF45] text-black text-sm rounded-md hover:bg-[#B9FF66]">
                Add Text
              </button>
              <button onClick={() => setShowModulePopup(true)} className="p-2 bg-[#AAFF45] text-black text-sm rounded-md hover:bg-[#B9FF66]">
                Add File
              </button>
            </div>
          </div>

          {showTextInput && (
            <div className="mt-4 p-4 bg-white shadow-md rounded-md border relative max-h-64 overflow-auto">
              <button onClick={() => setShowTextInput(false)} className="absolute top-2 right-2 text-red-500">X</button>
              <ReactQuillEditor value={textContent} onChange={setTextContent} height="100%" />
              <button onClick={handlePublishText} className="mt-4 px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-blue-700">Publish</button>
            </div>
          )}

          {publishedTexts.map((text, index) => (
            <div key={index} className="mt-4 p-4 bg-white rounded-md border overflow-auto relative">
              {editingIndex === index ? (
                <>
                  <ReactQuillEditor value={editingText} onChange={setEditingText} height="100%" />
                  <div className="mt-2 flex justify-end gap-2">
                    <button onClick={() => setEditingIndex(null)} className="px-3 py-1 bg-gray-400 text-white rounded-md hover:bg-slate-500">Cancel</button>
                    <button onClick={() => handleSaveEdit(index)} className="px-3 py-1 bg-[#AAFF45] text-black rounded-md hover:bg-[#B9FF66]">Save</button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => handleDeleteText(index)} className="absolute top-2 right-2 text-red-500">Delete</button>
                  <button onClick={() => handleEditText(index)} className="absolute top-2 right-20 text-blue-500">Edit</button>
                  <div className="ql-snow">
                    <div className="ql-editor" dangerouslySetInnerHTML={{ __html: text }}></div>
                  </div>
                </>
              )}
            </div>
          ))}

          {modules.map((module, index) => (
            <div key={index} className="mt-4 p-4 bg-white rounded-md border shadow-md relative h-auto">
              {editingModuleIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editingModule.title}
                    onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                    className="block w-full p-2 border rounded-md mb-2"
                  />
                  <textarea
                    value={editingModule.description}
                    onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                    className="block w-full p-2 border rounded-md mb-2"
                  ></textarea>

                  <input
                    type="file"
                    className="block w-full p-2 border rounded-md mb-2"
                    onChange={(e) => setEditingModule({ ...editingModule, file: e.target.files ? e.target.files[0] : null })}
                  />

                  <p className="text-sm text-gray-500">
                    {editingModule.file ? `New file selected: ${editingModule.file.name}` : `Current file: ${module.file?.name || "None"}`}
                  </p>

                  <button onClick={() => handleSaveModuleEdit(index)} className="px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-[#B9FF66]">Save</button>
                </>
              ) : (

                <>
                  <button onClick={() => handleDeleteModule(index)} className="absolute top-2 right-2 text-red-500">Delete</button>
                  <button onClick={() => handleEditModule(index)} className="absolute top-2 right-20 text-blue-500">Edit</button>
                  <h3 className="text-md font-semibold">{module.title}</h3>
                  <p className="text-sm text-gray-600">{module.description}</p>
                  {module.file && (
                    <p className="text-sm text-blue-500 underline cursor-pointer" onClick={() => handleOpenFile(module.file)}>
                      View File: {module.file.name}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        {showModulePopup && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30">
            <div className="bg-white p-4 rounded-md shadow-md w-96">
              <h2 className="text-lg font-semibold mb-2">Add Module</h2>

              <input
                type="text"
                placeholder="Module Title"
                className="block w-full p-2 border rounded-md mb-2"
                value={editingModule.title}
                onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
              />

              <textarea
                placeholder="Module Description"
                className="block w-full p-2 border rounded-md mb-2"
                value={editingModule.description}
                onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
              ></textarea>

              <input
                type="file"
                className="block w-full p-2 border rounded-md mb-2"
                onChange={(e) => setEditingModule({ ...editingModule, file: e.target.files ? e.target.files[0] : null })}
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModulePopup(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleAddModule(editingModule.title, editingModule.description, editingModule.file);
                    setEditingModule({ title: "", description: "", file: null });
                  }}
                  className="px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-[#B9FF66]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
        {deleteConfirmation && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30">
            <div className="bg-white p-4 rounded-md shadow-md w-96">
              <h2 className="text-lg font-semibold">Confirm Delete</h2>
              <p>Are you sure you want to delete this {deleteConfirmation.type}?</p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  No
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Coursepage;
