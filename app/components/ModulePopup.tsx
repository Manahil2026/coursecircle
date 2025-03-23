"use client";

import React, { useState, useEffect } from "react";

interface ModuleFormData {
  title: string;
  sections: { title: string; content: string }[];
  files: { name: string; file: File | null }[];
  moduleId: string;
}

interface Module {
  id: string;
  title: string;
  sections: { title: string; content: string }[];
  files: { name: string; url: string; type: string }[];
}

interface ModulePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleData: ModuleFormData) => void;
  initialData?: Module | null;
  isEditing?: boolean;
}

const ModulePopup: React.FC<ModulePopupProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}) => {
  const [moduleData, setModuleData] = useState<ModuleFormData>({
    title: "",
    sections: [{ title: "", content: "" }],
    files: [{ name: "", file: null }],
    moduleId: "",
  });
  const [titleError, setTitleError] = useState("");
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"sections" | "files">("sections");

  useEffect(() => {
    if (!isOpen) return;
    
    if (isEditing && initialData) {
      setModuleData({
        title: initialData.title,
        sections: initialData.sections.length ? initialData.sections : [{ title: "", content: "" }],
        files: initialData.files.length ? initialData.files.map(f => ({ name: f.name, file: null })) : [{ name: "", file: null }],
        moduleId: initialData.id,
      });
    } else {
      setModuleData({
        title: "",
        sections: [{ title: "", content: "" }],
        files: [{ name: "", file: null }],
        moduleId: "",
      });
    }
    
    setTitleError("");
    setFileErrors([]);
  }, [isOpen, isEditing, initialData]);

  const handleChange = (field: string, value: string) => {
    setModuleData(prev => ({ ...prev, [field]: value }));
    if (field === "title") setTitleError("");
  };

  const handleSectionChange = (index: number, field: string, value: string) => {
    const updatedSections = [...moduleData.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setModuleData(prev => ({ ...prev, sections: updatedSections }));
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    const updatedFiles = [...moduleData.files];
    updatedFiles[index] = { name: updatedFiles[index].name || file.name, file };
    setModuleData(prev => ({ ...prev, files: updatedFiles }));
    
    if (fileErrors[index]) {
      const newErrors = [...fileErrors];
      newErrors[index] = "";
      setFileErrors(newErrors);
    }
  };

  const handleFileNameChange = (index: number, value: string) => {
    const updatedFiles = [...moduleData.files];
    updatedFiles[index] = { ...updatedFiles[index], name: value };
    setModuleData(prev => ({ ...prev, files: updatedFiles }));
    
    if (fileErrors[index]) {
      const newErrors = [...fileErrors];
      newErrors[index] = "";
      setFileErrors(newErrors);
    }
  };

  const addItem = (type: "section" | "file") => {
    if (type === "section") {
      setModuleData(prev => ({
        ...prev,
        sections: [...prev.sections, { title: "", content: "" }]
      }));
    } else {
      setModuleData(prev => ({
        ...prev,
        files: [...prev.files, { name: "", file: null }]
      }));
      setFileErrors(prev => [...prev, ""]);
    }
  };

  const removeItem = (type: "section" | "file", index: number) => {
    if (type === "section" && moduleData.sections.length > 1) {
      const updatedSections = [...moduleData.sections];
      updatedSections.splice(index, 1);
      setModuleData(prev => ({ ...prev, sections: updatedSections }));
    } else if (type === "file" && moduleData.files.length > 1) {
      const updatedFiles = [...moduleData.files];
      updatedFiles.splice(index, 1);
      setModuleData(prev => ({ ...prev, files: updatedFiles }));
      
      const newErrors = [...fileErrors];
      newErrors.splice(index, 1);
      setFileErrors(newErrors);
    }
  };

  const validateAndSubmit = () => {
    let isValid = true;
    
    if (!moduleData.title.trim()) {
      setTitleError("Title required");
      isValid = false;
    }

    const newFileErrors = moduleData.files.map(file => 
      file.file && !file.name.trim() ? "Description required" : ""
    );
    
    if (newFileErrors.some(error => error)) {
      setFileErrors(newFileErrors);
      isValid = false;
    }

    if (!isValid) return;

    const dataToSave = {
      ...moduleData,
      sections: moduleData.sections.filter(s => s.title.trim() || s.content.trim()).length ? 
        moduleData.sections.filter(s => s.title.trim() || s.content.trim()) : 
        [{ title: "", content: "" }],
      files: moduleData.files.filter(f => f.file || f.name.trim()).length ? 
        moduleData.files.filter(f => f.file || f.name.trim()) : 
        [{ name: "", file: null }],
      moduleId: isEditing && initialData ? initialData.id : moduleData.moduleId
    };

    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-2">
      <div className="bg-white rounded shadow-lg w-full max-w-2xl h-auto max-h-[85vh] flex flex-col">
        <div className="p-2 border-b flex justify-between items-center">
          <h2 className="text-base font-medium">
            {isEditing ? "Edit Module" : "Add Module"}
          </h2>
            <button onClick={onClose} className="hover:bg-red-100">
              <img src="/asset/close_icon.svg" alt="Close" className="w-6 h-6" />
            </button>
        </div>

        <div className="flex-grow overflow-auto p-3">
          {/* Title */}
            <div className="mb-3">
            <label className="text-sm block mb-1">Title</label>
            <div>
              <input
              type="text"
              value={moduleData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Module title"
              className={`w-full p-1.5 text-sm border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded`}
              />
              {titleError && <p className="text-red-500 text-xs mt-0.5">{titleError}</p>}
            </div>
            </div>

          {/* Tabs */}
          <div className="flex border-b mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("sections")}
              className={`py-1 px-3 text-xs font-medium ${
                activeTab === "sections"
                  ? "border-b-2 border-[#AAFF45] text-gray-800"
                  : "text-gray-500"
              }`}
            >
              Sections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("files")}
              className={`py-1 px-3 text-xs font-medium ${
                activeTab === "files"
                  ? "border-b-2 border-[#AAFF45] text-gray-800"
                  : "text-gray-500"
              }`}
            >
              Files
            </button>
          </div>

          {/* Sections Tab */}
          {activeTab === "sections" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Optional sections</span>
                <button
                  type="button"
                  onClick={() => addItem("section")}
                  className="px-2 py-1 bg-[#AAFF45] text-xs font-medium rounded"
                >
                  Add Section
                </button>
              </div>

              <div className="space-y-2">
                {moduleData.sections.map((section, index) => (
                  <div
                    key={`section-${index}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm block">Section {index + 1}</span>
                      {moduleData.sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem("section", index)}
                          className="text-xs text-red-500 flex items-center"
                        >
                          <img src="/asset/delete_icon.svg" alt="Delete" className="w-4 h-4 mr-1" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Title"
                      value={section.title}
                      onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded mb-1"
                    />

                    <textarea
                      placeholder="Content"
                      value={section.content}
                      onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                      rows={2}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === "files" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Optional files</span>
                <button
                  type="button"
                  onClick={() => addItem("file")}
                  className="px-2 py-1 bg-[#AAFF45] text-xs font-medium rounded"
                >
                  Add File
                </button>
              </div>

              <div className="space-y-2">
                {moduleData.files.map((fileItem, index) => (
                  <div
                    key={`file-${index}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">File {index + 1}</span>
                      {moduleData.files.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem("file", index)}
                          className="text-xs text-red-500"
                        >
                          <img src="/asset/delete_icon.svg" alt="Delete" className="w-4 h-4 mr-1" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 mb-1">
                      <input
                      type="file"
                      onChange={(e) => handleFileChange(index, e)}
                      className="w-full text-xs p-1 border border-gray-300 rounded file:mr-2 file:py-1 file:px-2 file:text-xs file:border-0 file:rounded hover:file:bg-gray-200"
                      />
                    </div>
                    
                    {isEditing && initialData?.files[index]?.url && !fileItem.file && (
                      <p className="text-xs text-gray-500 mb-1">Current: {initialData.files[index].name}</p>
                    )}

                    <div>
                      <input
                        type="text"
                        placeholder="Description"
                        value={fileItem.name}
                        onChange={(e) => handleFileNameChange(index, e.target.value)}
                        className={`w-full p-1.5 text-sm border ${fileErrors[index] ? 'border-red-500' : 'border-gray-300'} rounded`}
                      />
                      {fileErrors[index] && (
                        <p className="text-red-500 text-xs mt-0.5">{fileErrors[index]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-2 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-gray-100 text-sm rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={validateAndSubmit}
            className="px-3 py-1 bg-[#AAFF45] text-sm rounded"
          >
            {isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModulePopup;