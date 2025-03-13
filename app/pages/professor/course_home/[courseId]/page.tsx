"use client";

import React, { useState, useEffect } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";
import CourseInstructions from "@/app/components/pro_course_home_components/CourseInstructions";
import ModulePopup from "@/app/components/ModulePopup";
import "react-quill-new/dist/quill.snow.css";
import Image from "next/image";
import { useParams } from "next/navigation";

// Interface for the module data from the API
interface Module {
  id: string;
  title: string;
  sections: { title: string; content: string }[];
  files: { name: string; url: string; type: string }[];
}

// Interface for the form data when creating a module
interface ModuleFormData {
  title: string;
  sections: { title: string; content: string }[];
  files: { name: string; file: File | null }[];
}

const Coursepage: React.FC = () => {
  const [showModulePopup, setShowModulePopup] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const courseId = params?.courseId as string;
  const [course, setCourse] = useState(null);

  useEffect(() => {

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch course details");
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchModules = async () => {
      try {
        const response = await fetch(`/api/modules?courseId=${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch modules");
        const data = await response.json();
        console.log("Fetched modules:", data); // Log fetched modules
        setModules(data);
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };

    fetchCourse();
    fetchModules();
  }, [courseId]);

  const toggleExpand = (key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchModule = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}`);
      if (!response.ok) throw new Error("Module not found");
      const data = await response.json();
      setSelectedModule(data);
    } catch (error) {
      console.error("Error fetching module:", error);
    }
  };


  const handleAddModule = async (moduleData: ModuleFormData) => {
    if (!courseId) {
      console.error("No course selected!");
      return;
    }

    try {
      // Step 1: Create the module
      const moduleResponse = await fetch("/api/modules/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: moduleData.title,
          courseId,
          sections: moduleData.sections.map((section) => ({
            title: section.title,
            content: section.content,
          })),
          files: [], // Initially no files in the module creation
        }),
      });

      if (!moduleResponse.ok) {
        const errorData = await moduleResponse.json();
        throw new Error(errorData.error || "Failed to create module");
      }

      const createdModule = await moduleResponse.json();
      const moduleId = createdModule.id;

      if (!moduleId) {
        throw new Error("Module creation failed, no moduleId received");
      }

      // Step 2: Upload files if any exist
      if (moduleData.files && moduleData.files.length > 0 && moduleData.files[0].file) {
        const uploadedFiles = await Promise.all(
          moduleData.files.map(async (fileItem) => {
            if (!fileItem.file) return null;

            const formData = new FormData();
            formData.append("file", fileItem.file);
            formData.append("moduleId", moduleId);

            const uploadResponse = await fetch("/api/files", {
              method: "POST",
              body: formData,
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json();
              throw new Error(errorData.error || "File upload failed");
            }

            return await uploadResponse.json();
          })
        );

        // Step 3: Update module with file data
        const fileData = uploadedFiles
          .filter((file): file is NonNullable<typeof file> => file !== null)
          .map((file) => ({
            id: file.id,
            name: file.name,
            url: file.url,
            type: file.type,
            moduleId: moduleId,
          }));

        if (fileData.length > 0) {
          const updateResponse = await fetch(`/api/modules/${moduleId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ files: fileData }),
          });

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.error || "Failed to update module with files");
          }
        }
      }

      // Update local state with the new module
      setModules((prevModules) => [...prevModules, {
        id: createdModule.id,
        title: createdModule.title,
        sections: createdModule.sections || [],
        files: createdModule.files || []
      }]);
      
      setShowModulePopup(false);
    } catch (error) {
      console.error("Error saving module:", error);
    }
  };


  // Deleting a module using moduleId
  const handleDeleteModule = async (moduleId: string) => {
    if (!moduleId) {
      console.error("No module ID provided for deletion");
      return;
    }

    try {
      const deleteResponse = await fetch(`/api/modules/${moduleId}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || "Failed to delete module");
      }

      // Update local state after successful deletion
      setModules((prevModules) => prevModules.filter(module => module.id !== moduleId));
      
      // If the deleted module was selected, clear the selection
      if (selectedModule?.id === moduleId) {
        setSelectedModule(null);
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      // You might want to show an error message to the user here
    }
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
            <CourseInstructions expandedRows={expandedRows} toggleExpand={toggleExpand} />
          )}
  
          {/* Modules with flex layout */}
          <div className="w-full mt-4">
            {modules.map((module) => (
              <div key={module.id} className="mb-6 text-sm">
                <div className="bg-[#AAFF45] border border-gray-400 p-2 rounded-t-sm flex justify-between items-center">
                  <span>{module.title}</span>
                  <button onClick={() => handleDeleteModule(module.id)}>
                    <Image
                      src="/asset/delete_icon.svg"
                      alt="Delete"
                      width={18}
                      height={18}
                    />
                  </button>
                </div>
  
                {/* Sections */}
                {(module.sections || []).map((section, sectionIndex) => (
                  <div
                    key={`section-${module.id}-${sectionIndex}`}
                    className="border border-gray-400 border-t-0 rounded-sm"
                  >
                    <div
                      className="flex justify-between items-center p-2 cursor-pointer"
                      onClick={() =>
                        toggleExpand(`section-${module.id}-${sectionIndex}`)
                      }
                    >
                      {section.title}
                      <Image
                        src={
                          expandedRows[`section-${module.id}-${sectionIndex}`]
                            ? "/asset/arrowup_icon.svg"
                          : "/asset/arrowdown_icon.svg"
                        }
                        alt="Expand arrow"
                        width={16}
                        height={16}
                      />
                    </div>
                    {expandedRows[`section-${module.id}-${sectionIndex}`] && (
                      <p className="p-2 bg-gray-200">{section.content}</p>
                    )}
                  </div>
                ))}
  
                {/* Files */}
                {(module.files || []).map((file, fileIndex) => (
                  <div key={`file-${module.id}-${fileIndex}`} className="border border-gray-400 border-t-0 rounded-sm">
                    <div className="flex justify-between items-center p-2 cursor-pointer" onClick={() => toggleExpand(`file-${module.id}-${fileIndex}`)}>
                      {file.name}
                      <Image
                        src={
                          expandedRows[`file-${module.id}-${fileIndex}`]
                            ? "/asset/arrowup_icon.svg"
                          : "/asset/arrowdown_icon.svg"
                        }
                        alt="Expand arrow"
                        width={16}
                        height={16}
                      />
                    </div>
                    {expandedRows[`file-${module.id}-${fileIndex}`] && (
                      <p className="p-2 bg-gray-200">{file.name}</p>
                    )}
                  </div>
                ))}
  
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
