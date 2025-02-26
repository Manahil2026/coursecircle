"use client";

import React, { useState } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";
import "react-quill-new/dist/quill.snow.css";
import Image from "next/image";

const Coursepage: React.FC = () => {
  const [showModulePopup, setShowModulePopup] = useState(false);
  const [modules, setModules] = useState<
    {
      title: string;
      sections: { title: string; content: string }[];
      files: { name: string; file: File | null }[];
    }[]
  >([]);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [moduleData, setModuleData] = useState({
    title: "",
    sections: [{ title: "", content: "" }],
    files: [{ name: "", file: null as File | null }],
  });
  const [errors, setErrors] = useState({
    title: "",
    sections: [{ title: "", content: "" }],
    files: [{ name: "" }],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setModuleData({ ...moduleData, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (index: number, field: string, value: string) => {
    const updatedSections = [...moduleData.sections];
    if (field === "title") {
      updatedSections[index].title = value;
    } else if (field === "content") {
      updatedSections[index].content = value;
    }
    setModuleData({ ...moduleData, sections: updatedSections });
  };

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedFiles = [...moduleData.files];
    updatedFiles[index] = {
      name: e.target.files && e.target.files[0] ? e.target.files[0].name : "",
      file: e.target.files ? e.target.files[0] : null,
    };
    setModuleData({ ...moduleData, files: updatedFiles });
  };

  const handleFileNameChange = (index: number, value: string) => {
    const updatedFiles = [...moduleData.files];
    updatedFiles[index].name = value;
    setModuleData({ ...moduleData, files: updatedFiles });
  };

  const addSection = () => {
    setModuleData({
      ...moduleData,
      sections: [...moduleData.sections, { title: "", content: "" }],
    });
    setErrors({
      ...errors,
      sections: [...errors.sections, { title: "", content: "" }],
    });
  };

  const removeSection = (index: number) => {
    if (moduleData.sections.length > 1) {
      const updatedSections = [...moduleData.sections];
      updatedSections.splice(index, 1);
      setModuleData({ ...moduleData, sections: updatedSections });

      const updatedErrors = [...errors.sections];
      updatedErrors.splice(index, 1);
      setErrors({ ...errors, sections: updatedErrors });
    }
  };

  const addFile = () => {
    setModuleData({
      ...moduleData,
      files: [...moduleData.files, { name: "", file: null }],
    });
    setErrors({
      ...errors,
      files: [...errors.files, { name: "" }],
    });
  };

  const removeFile = (index: number) => {
    if (moduleData.files.length > 1) {
      const updatedFiles = [...moduleData.files];
      updatedFiles.splice(index, 1);
      setModuleData({ ...moduleData, files: updatedFiles });

      const updatedErrors = [...errors.files];
      updatedErrors.splice(index, 1);
      setErrors({ ...errors, files: updatedErrors });
    }
  };

  const validateForm = () => {
    const newErrors = {
      title: "",
      sections: moduleData.sections.map((section) => ({
        title: !section.title.trim() ? "Section title is required" : "",
        content: !section.content.trim() ? "Section content is required" : "",
      })),
      files: moduleData.files.map((file) => ({
        name: file.file && !file.name.trim() ? "File name is required" : "",
      })),
    };

    if (!moduleData.title.trim()) newErrors.title = "Module title is required";

    setErrors(newErrors);

    return (
      !newErrors.title &&
      !newErrors.sections.some((section) => section.title || section.content) &&
      !newErrors.files.some((file) => file.name)
    );
  };

  const handleAddModule = () => {
    if (!validateForm()) return;

    setModules([...modules, moduleData]);
    setModuleData({
      title: "",
      sections: [{ title: "", content: "" }],
      files: [{ name: "", file: null }],
    });
    setShowModulePopup(false);
  };

  const handleDeleteModule = (index: number) => {
    const updatedModules = [...modules];
    updatedModules.splice(index, 1);
    setModules(updatedModules);
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

          {/* Instructions Module - only shown when no modules exist */}
          {modules.length === 0 && (
            <div className="w-full mt-4">
              <div className="mb-6 text-sm">
                {/* Title Section */}
                <div className="bg-[#AAFF45] border border-gray-400 p-2 rounded-t-sm">
                  Getting Started with Modules
                </div>

                {/* Description Section */}
                <div className="border border-gray-400 border-t-0 rounded-sm">
                  <div
                    className="flex justify-between items-center p-2 cursor-pointer"
                    onClick={() => toggleExpand("instruction-desc")}
                  >
                    How to Add a Module
                    <Image
                      src={
                        expandedRows["instruction-desc"]
                          ? "/asset/arrowup_icon.svg"
                          : "/asset/arrowdown_icon.svg"
                      }
                      alt="Expand arrow"
                      width={16}
                      height={16}
                    />
                  </div>
                  {expandedRows["instruction-desc"] && (
                    <div className="px-2 pb-2">
                      <p className="mb-2">
                        Follow these steps to create your first module:
                      </p>
                      <ol className="list-decimal ml-5 space-y-1">
                        <li>
                          Click the "Add Module" button in the top right corner
                        </li>
                        <li>Fill in the required module title</li>
                        <li>
                          Add one or more sections with titles and content
                        </li>
                        <li>
                          Upload one or more files with descriptions (optional)
                        </li>
                        <li>Click "Create Module" to save your new module</li>
                      </ol>
                    </div>
                  )}
                </div>

                {/* Features Section */}
                <div className="border border-gray-400 border-t-0 rounded-sm">
                  <div
                    className="flex justify-between items-center p-2 cursor-pointer"
                    onClick={() => toggleExpand("instruction-features")}
                  >
                    Module Features
                    <Image
                      src={
                        expandedRows["instruction-features"]
                          ? "/asset/arrowup_icon.svg"
                          : "/asset/arrowdown_icon.svg"
                      }
                      alt="Expand arrow"
                      width={16}
                      height={16}
                    />
                  </div>
                  {expandedRows["instruction-features"] && (
                    <div className="px-2 pb-2">
                      <p>Each module has the following features:</p>
                      <ul className="list-disc ml-5 space-y-1 mt-2">
                        <li>Multiple sections to organize content</li>
                        <li>Multiple file attachments for course materials</li>
                        <li>Expandable sections to show or hide content</li>
                        <li>Delete option to remove unwanted modules</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Tips Section */}
                <div className="border border-gray-400 border-t-0 rounded-b-sm">
                  <div
                    className="flex justify-between items-center p-2 cursor-pointer"
                    onClick={() => toggleExpand("instruction-tips")}
                  >
                    Tips
                    <Image
                      src={
                        expandedRows["instruction-tips"]
                          ? "/asset/arrowup_icon.svg"
                          : "/asset/arrowdown_icon.svg"
                      }
                      alt="Expand arrow"
                      width={16}
                      height={16}
                    />
                  </div>
                  {expandedRows["instruction-tips"] && (
                    <p className="px-2 pb-2">
                      Use clear, descriptive titles and thorough descriptions to
                      help students understand module content. Organize related
                      materials in separate sections to improve navigation. This
                      instruction table will disappear once you create your
                      first module.
                    </p>
                  )}
                </div>
              </div>
            </div>
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
                      <p className="px-2 pb-2">{section.content}</p>
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
                          <p className="px-2 pb-2">
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

        {/* Module Pop-up */}
        {showModulePopup && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30">
            <div className="bg-white p-6 rounded-sm shadow-md w-3/4 max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Add Module</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Module Title"
                  value={moduleData.title}
                  onChange={handleInputChange}
                  className="block w-full p-2 border border-gray-400 rounded-sm"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Sections */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-medium">Sections</h3>
                  <button
                    onClick={addSection}
                    className="p-1 bg-[#AAFF45] text-black text-sm rounded-sm hover:bg-[#B9FF66]"
                  >
                    + Add Section
                  </button>
                </div>

                {moduleData.sections.map((section, index) => (
                  <div
                    key={`section-form-${index}`}
                    className="p-3 border border-gray-300 rounded-sm mb-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">
                        Section {index + 1}
                      </h4>
                      {moduleData.sections.length > 1 && (
                        <button
                          onClick={() => removeSection(index)}
                          className="p-1 bg-red-500 text-white text-xs rounded-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="mb-2">
                      <input
                        type="text"
                        placeholder="Section Title"
                        value={section.title}
                        onChange={(e) =>
                          handleSectionChange(index, "title", e.target.value)
                        }
                        className="block w-full p-2 border border-gray-400 rounded-sm"
                      />
                      {errors.sections[index]?.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.sections[index].title}
                        </p>
                      )}
                    </div>

                    <div>
                      <textarea
                        placeholder="Section Content"
                        value={section.content}
                        onChange={(e) =>
                          handleSectionChange(index, "content", e.target.value)
                        }
                        className="block w-full p-2 border border-gray-400 rounded-sm h-20"
                      ></textarea>
                      {errors.sections[index]?.content && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.sections[index].content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Files */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-medium">Files</h3>
                  <button
                    onClick={addFile}
                    className="p-1 bg-[#AAFF45] text-black text-sm rounded-sm hover:bg-[#B9FF66]"
                  >
                    + Add File
                  </button>
                </div>

                {moduleData.files.map((fileItem, index) => (
                  <div
                    key={`file-form-${index}`}
                    className="p-3 border border-gray-300 rounded-sm mb-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">File {index + 1}</h4>
                      {moduleData.files.length > 1 && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 bg-red-500 text-white text-xs rounded-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="mb-2">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(index, e)}
                        className="block w-full p-2 border border-gray-400 rounded-sm"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="File Description (optional)"
                        value={fileItem.name}
                        onChange={(e) =>
                          handleFileNameChange(index, e.target.value)
                        }
                        className="block w-full p-2 border border-gray-400 rounded-sm"
                      />
                      {errors.files[index]?.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.files[index].name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

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
