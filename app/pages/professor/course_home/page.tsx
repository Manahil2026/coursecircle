"use client";

import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";
import CourseInstructions from "@/app/components/pro_course_home_components/CourseInstructions";
import ModulePopup from "@/app/components/ModulePopup";
import "react-quill-new/dist/quill.snow.css";
import Image from "next/image";

interface ModuleType {
  title: string;
  sections: { title: string; content: string }[];
  files: { name: string; file: File | null }[];
}

const Coursepage: React.FC = () => {
  const [showModulePopup, setShowModulePopup] = useState(false);
  const [modules, setModules] = useState<ModuleType[]>([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddModule = (moduleData: ModuleType) => {
    setModules([...modules, moduleData]);
    setShowModulePopup(false);
  };

  const handleDeleteModule = (index: number) => {
    const updatedModules = [...modules];
    updatedModules.splice(index, 1);
    setModules(updatedModules);
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

          {/* Using the CourseInstructions Component */}
          {modules.length === 0 && (
            <CourseInstructions 
              expandedRows={expandedRows} 
              toggleExpand={toggleExpand} 
            />
          )}

          {/* Modules with flex layout */}
          <div className="w-full mt-4">
            {modules.map((module, moduleIndex) => (
              <div key={moduleIndex} className="mb-6 text-sm">
                {/* Title Section with Delete Button */}
                <div className="bg-[#AAFF45] border border-gray-400 p-2 rounded-t-sm flex justify-between items-center">
                  <span>{module.title}</span>
                  <button onClick={() => handleDeleteModule(moduleIndex)}>
                    <Image
                      src="/asset/delete_icon.svg"
                      alt="Delete"
                      width={18}
                      height={18}
                    />
                  </button>
                </div>

                {/* Sections */}
                {module.sections.map((section, sectionIndex) => (
                  <div
                    key={`section-${moduleIndex}-${sectionIndex}`}
                    className="border border-gray-400 border-t-0 rounded-sm"
                  >
                    <div
                      className="flex justify-between items-center p-2 cursor-pointer"
                      onClick={() =>
                        toggleExpand(`section-${moduleIndex}-${sectionIndex}`)
                      }
                    >
                      {section.title}
                      <Image
                        src={
                          expandedRows[`section-${moduleIndex}-${sectionIndex}`]
                            ? "/asset/arrowup_icon.svg"
                            : "/asset/arrowdown_icon.svg"
                        }
                        alt="Expand arrow"
                        width={16}
                        height={16}
                      />
                    </div>
                    {expandedRows[`section-${moduleIndex}-${sectionIndex}`] && (
                      <p className="p-2 bg-gray-200">{section.content}</p>
                    )}
                  </div>
                ))}

                {/* Files */}
                {module.files.map(
                  (fileItem, fileIndex) =>
                    fileItem.file && (
                      <div
                        key={`file-${moduleIndex}-${fileIndex}`}
                        className="border border-gray-400 border-t-0 rounded-sm"
                      >
                        <div
                          className="flex justify-between items-center p-2 cursor-pointer"
                          onClick={() =>
                            toggleExpand(`file-${moduleIndex}-${fileIndex}`)
                          }
                        >
                          {fileItem.name || fileItem.file.name}
                          <Image
                            src={
                              expandedRows[`file-${moduleIndex}-${fileIndex}`]
                                ? "/asset/arrowup_icon.svg"
                                : "/asset/arrowdown_icon.svg"
                            }
                            alt="Expand arrow"
                            width={16}
                            height={16}
                          />
                        </div>
                        {expandedRows[`file-${moduleIndex}-${fileIndex}`] && (
                          <p className="p-2 bg-gray-200">
                            File: {fileItem.file.name}
                          </p>
                        )}
                      </div>
                    )
                )}

                {/* Empty bottom border for the last item */}
                <div className="border-t-0 rounded-b-sm h-1"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Using the ModulePopup Component */}
        <ModulePopup
          isOpen={showModulePopup}
          onClose={() => setShowModulePopup(false)}
          onSave={handleAddModule}
        />
      </div>
    </div>
  );
};

export default Coursepage;