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
  const [showModulePopup, setShowModulePopup] = useState(false);
  const [modules, setModules] = useState<{ title: string; description: string; file: File | null }[]>([]);
  const router = useRouter();

  const handlePublishText = () => {
    if (textContent.trim()) {
      setPublishedTexts([...publishedTexts, textContent]);
      setTextContent("");
      setShowTextInput(false);
    }
  };

  const handleDeleteText = (index: number) => {
    setPublishedTexts(publishedTexts.filter((_, i) => i !== index));
  };

  const handleAddModule = (title: string, description: string, file: File | null) => {
    setModules([...modules, { title, description, file }]);
    setShowModulePopup(false);
  };

  const handleDeleteModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleOpenFile = (file: File | null) => {
    if (!file) return; // Ensure file is not null before proceeding
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
              <button onClick={() => setShowTextInput(true)} className=" p-2 bg-[#AAFF45] text-black text-sm rounded-md hover:bg-[#B9FF66]">
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

              <ReactQuillEditor
                value={textContent}
                onChange={setTextContent}
                height="100%"
              />
              <button onClick={handlePublishText} className="mt-28 px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-blue-700">Publish</button>
            </div>
          )}

          {publishedTexts.map((text, index) => (
            <div key={index} className="mt-4 p-4 bg-white rounded-md border overflow-auto relative">
              <button onClick={() => handleDeleteText(index)} className="absolute top-2 right-2 text-red-500">X</button>
              <div className="ql-snow">
                <div className="ql-editor" dangerouslySetInnerHTML={{ __html: text }}></div>
              </div>
            </div>
          ))}

          {/* Display Modules in Main Content */}
          {modules.map((module, index) => (
            <div key={index} className="mt-4 p-4 bg-white rounded-md border shadow-md relative h-auto">
              <button onClick={() => handleDeleteModule(index)} className="absolute top-2 right-2 text-red-500">X</button>
              <h3 className="text-md font-semibold">{module.title}</h3>
              <p className="text-sm text-gray-600">{module.description}</p>
              {module.file && (
                <p className="text-sm text-blue-500 underline cursor-pointer" onClick={() => handleOpenFile(module.file)}>
                  View File: {module.file.name}
                </p>
              )}
            </div>
          ))}

          {showModulePopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-md shadow-md w-96 relative">
                <button onClick={() => setShowModulePopup(false)} className="absolute top-2 right-2 text-red-500">X</button>
                <h2 className="text-lg font-semibold mb-4">Create Module</h2>
                <input type="text" placeholder="Title" id="moduleTitle" className="block w-full p-2 border rounded-md mb-2" />
                <textarea placeholder="Description" id="moduleDescription" className="block w-full p-2 border rounded-md mb-2"></textarea>
                <input type="file" id="moduleFile" className="block w-full p-2 border rounded-md mb-2" />
                <button onClick={() => handleAddModule(
                  (document.getElementById('moduleTitle') as HTMLInputElement)?.value,
                  (document.getElementById('moduleDescription') as HTMLTextAreaElement)?.value,
                  (document.getElementById('moduleFile') as HTMLInputElement)?.files?.[0] || null
                )} className="px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-blue-700">Add File</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Coursepage;
