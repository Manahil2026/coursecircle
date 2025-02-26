"use client";

import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";
import "react-quill-new/dist/quill.snow.css";
import Image from "next/image";

const Coursepage: React.FC = () => {
  const [showModulePopup, setShowModulePopup] = useState(false);
  const [modules, setModules] = useState<
    { title: string; description: string; file: File | null; photo: File | null }[]
  >([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [moduleData, setModuleData] = useState({
    title: "",
    description: "",
    file: null as File | null,
    photo: null as File | null,
  });
  const [errors, setErrors] = useState({ title: "", description: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setModuleData({ ...moduleData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "file" | "photo") => {
    setModuleData({ ...moduleData, [type]: e.target.files ? e.target.files[0] : null });
  };

  const handleAddModule = () => {
    const newErrors = { title: "", description: "" };
    if (!moduleData.title.trim()) newErrors.title = "Title is required";
    if (!moduleData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);

    if (newErrors.title || newErrors.description) return;

    setModules([...modules, moduleData]);
    setModuleData({ title: "", description: "", file: null, photo: null });
    setShowModulePopup(false);
  };

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex">
      <Sidebar_dashboard />
      <div className="flex min-h-screen bg-gray-100 flex-1 pl-52 px-6">
        <CourseMenu />

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h1 className="text-base font-medium">Professor Homepage</h1>
            <button
              onClick={() => setShowModulePopup(true)}
              className="p-2 mt-2 bg-[#AAFF45] text-black text-sm rounded-sm hover:bg-[#B9FF66]"
            >
              Add Module
            </button>
          </div>

          {/* Modules with flex layout */}
          <div className="w-full mt-4">
            {modules.map((module, index) => (
              <div key={index} className="mb-6 text-sm">
                {/* Title Section */}
                <div className="bg-[#AAFF45] border border-gray-400 p-2 rounded-t-sm">
                  {module.title}
                </div>

                {/* Description Section */}
                <div className="border border-gray-400 border-t-0 rounded-sm">
                  <div 
                    className="flex justify-between items-center p-2 cursor-pointer" 
                    onClick={() => toggleExpand(`desc-${index}`)}
                  >
                    Description
                    <Image 
                      src={expandedRows[`desc-${index}`] ? "/asset/arrowup_icon.svg" : "/asset/arrowdown_icon.svg"} 
                      alt="Expand arrow" 
                      width={16} 
                      height={16} 
                    />
                  </div>
                  {expandedRows[`desc-${index}`] && (
                    <p className="px-2 pb-2">{module.description}</p>
                  )}
                </div>

                {/* File Section */}
                <div className="border border-gray-400 border-t-0 rounded-sm">
                  <div 
                    className="flex justify-between items-center p-2 cursor-pointer" 
                    onClick={() => toggleExpand(`file-${index}`)}
                  >
                    File
                    <Image 
                      src={expandedRows[`file-${index}`] ? "/asset/arrowup_icon.svg" : "/asset/arrowdown_icon.svg"} 
                      alt="Expand arrow" 
                      width={16} 
                      height={16} 
                    />
                  </div>
                  {expandedRows[`file-${index}`] && (
                    <p className="px-2 pb-2">{module.file?.name || "N/A"}</p>
                  )}
                </div>

                {/* Photo Section */}
                <div className="border border-gray-400 border-t-0 rounded-b-sm">
                  <div 
                    className="flex justify-between items-center p-2 cursor-pointer" 
                    onClick={() => toggleExpand(`photo-${index}`)}
                  >
                    Photo
                    <Image 
                      src={expandedRows[`photo-${index}`] ? "/asset/arrowup_icon.svg" : "/asset/arrowdown_icon.svg"} 
                      alt="Expand arrow" 
                      width={16} 
                      height={16} 
                    />
                  </div>
                  {expandedRows[`photo-${index}`] && module.photo && (
                    <div className="px-2 pb-2">
                      <img
                        src={URL.createObjectURL(module.photo)}
                        alt="Module"
                        className="w-16 h-16 object-cover mt-2 rounded-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Pop-up */}
        {showModulePopup && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30">
            <div className="bg-white p-6 rounded-sm shadow-md w-96">
              <h2 className="text-lg font-semibold mb-4">Add Module</h2>

              <input
                type="text"
                name="title"
                placeholder="Module Title"
                value={moduleData.title}
                onChange={handleInputChange}
                className="block w-full p-2 border border-gray-400 rounded-sm mb-2"
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

              <textarea
                name="description"
                placeholder="Module Description"
                value={moduleData.description}
                onChange={handleInputChange}
                className="block w-full p-2 border border-gray-400 rounded-sm mb-2"
              ></textarea>
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

              <input
                type="file"
                onChange={(e) => handleFileChange(e, "file")}
                className="block w-full p-2 border border-gray-400 rounded-sm mb-2"
              />
              <input
                type="file"
                onChange={(e) => handleFileChange(e, "photo")}
                className="block w-full p-2 border border-gray-400 rounded-sm mb-2"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModulePopup(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-sm hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddModule}
                  className="px-4 py-2 bg-[#AAFF45] text-black rounded-sm hover:bg-[#B9FF66]"
                >
                  Create Module
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coursepage;