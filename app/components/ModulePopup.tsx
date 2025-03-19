"use client";

import React, { useState, useEffect } from "react";

interface ModuleFormData {
  title: string;
  sections: { title: string; content: string }[];
  files: { name: string; file: File | null }[];
  moduleId: string;  // Make moduleId required
}

interface Module {
  id: string;
  title: string;
  sections: { title: string; content: string }[];
  files: { name: string; url: string; type: string }[];
}

interface ModuleFormErrors {
  title: string;
  sections: { title: string; content: string }[];
  files: { name: string }[];
}

interface ModulePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleData: ModuleFormData) => void;
  initialData?: Module | null;
  isEditing?: boolean;
}

const ModulePopup: React.FC<ModulePopupProps> = ({ isOpen, onClose, onSave, initialData, isEditing }) => {
  const [moduleData, setModuleData] = useState<ModuleFormData>({
    title: "",
    sections: [{ title: "", content: "" }],
    files: [{ name: "", file: null }],
    moduleId: "",
  });
  
  const [errors, setErrors] = useState<ModuleFormErrors>({
    title: "",
    sections: [{ title: "", content: "" }],
    files: [{ name: "" }],
  });

  // Initialize form data when editing
  useEffect(() => {
    if (isEditing && initialData) {
      setModuleData({
        title: initialData.title,
        sections: initialData.sections.map(section => ({
          title: section.title,
          content: section.content
        })),
        files: initialData.files.map(file => ({
          name: file.name,
          file: null
        })),
        moduleId: initialData.id
      });
    } else {
      // Reset form when not editing
      setModuleData({
        title: "",
        sections: [{ title: "", content: "" }],
        files: [{ name: "", file: null }],
        moduleId: "",
      });
    }
  }, [isEditing, initialData]);

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

  const handleSave = () => {
    if (!validateForm()) return;
    
    // Ensure moduleId is included in the data
    const dataToSave = {
      ...moduleData,
      moduleId: isEditing && initialData ? initialData.id : moduleData.moduleId
    };
    
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded-sm shadow-md w-3/4 max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Module' : 'Add Module'}</h2>

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
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-sm hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#AAFF45] text-black rounded-sm hover:bg-[#B9FF66]"
          >
            {isEditing ? 'Update Module' : 'Create Module'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModulePopup;