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
  published: boolean;
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
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isModulesLoading, setIsModulesLoading] = useState(true);
  //const [isPublished, setIsPublished] = useState(false);

  const params = useParams();
  const courseId = params?.courseId as string;
  const [course, setCourse] = useState(null);

  const fetchModules = async () => {
    try {
      setIsModulesLoading(true);
      const response = await fetch(`/api/modules?courseId=${courseId}`);
      if (!response.ok) throw new Error("Failed to fetch modules");
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setIsModulesLoading(false);
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch course details");
        const data = await response.json();
        setCourse(data);
        //setIsPublished(data.published || false);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
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

  const handleEditModule = async (moduleId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/modules/${moduleId}`);
      if (!response.ok) throw new Error("Module not found");
      const moduleData = await response.json();
      setSelectedModule(moduleData);
      setIsEditing(true);
      setShowModulePopup(true);
    } catch (error) {
      console.error("Error fetching module for edit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async (moduleData: ModuleFormData) => {
    if (!courseId) {
      console.error("No course selected!");
      return;
    }

    try {
      setLoading(true);
      if (isEditing && selectedModule) {
        // Update existing module
        const updateResponse = await fetch(`/api/modules/${selectedModule.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: moduleData.title,
            sections: moduleData.sections.map((section) => ({
              title: section.title,
              content: section.content,
            })),
            files: selectedModule.files, // Keep existing files
          }),
        });
        
        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || "Failed to update module");
        }

        // Handle any new file uploads if present
        if (moduleData.files && moduleData.files.length > 0 && moduleData.files[0].file) {
          const uploadedFiles = await Promise.all(
            moduleData.files.map(async (fileItem) => {
              if (!fileItem.file) return null;

              const formData = new FormData();
              formData.append("file", fileItem.file);
              formData.append("moduleId", selectedModule.id);

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

          const fileData = uploadedFiles
            .filter((file): file is NonNullable<typeof file> => file !== null)
            .map((file) => ({
              id: file.id,
              name: file.name,
              url: file.url,
              type: file.type,
              moduleId: selectedModule.id,
            }));

          if (fileData.length > 0) {
            const updateFilesResponse = await fetch(`/api/modules/${selectedModule.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                files: [...selectedModule.files, ...fileData]
              }),
            });

            if (!updateFilesResponse.ok) {
              const errorData = await updateFilesResponse.json();
              throw new Error(errorData.error || "Failed to update module with files");
            }
          }
        }
      } else {
        // Create new module
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
            files: [],
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

        // Handle file uploads if present
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
              // Fetch the latest module data first
              const moduleResponse = await fetch(`/api/modules/${moduleId}`);
              if (!moduleResponse.ok) {
                throw new Error("Failed to fetch updated module data");
              }
              const currentModule = await moduleResponse.json();
              
              // Combine existing and new files
              const allFiles = [...currentModule.files, ...fileData];
              
              // Update the module with complete data
              const updateResponse = await fetch(`/api/modules/${moduleId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: currentModule.title,
                  sections: currentModule.sections,
                  files: allFiles
                }),
              });
            
              if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.error || "Failed to update module with files");
              }
            }
        }
      }
      
      // Fetch updated modules data
      await fetchModules();
      
      // Reset states
      setShowModulePopup(false);
      setIsEditing(false);
      setSelectedModule(null);
    } catch (error) {
      console.error("Error saving module:", error);
    } finally {
      setLoading(false);
    }
  };

  // Deleting a module using moduleId
  const handleDeleteModule = async (moduleId: string) => {
    if (!moduleId) {
      console.error("No module ID provided for deletion");
      return;
    }

    setModuleToDelete(moduleId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteModule = async () => {
    if (!moduleToDelete) return;

    try {
      setLoading(true);
      const deleteResponse = await fetch(`/api/modules/${moduleToDelete}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || "Failed to delete module");
      }

      // Fetch updated modules data
      await fetchModules();
      
      // Close the confirmation popup
      setShowDeleteConfirmation(false);
      setModuleToDelete(null);
    } catch (error) {
      console.error("Error deleting module:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading screen if either course or modules are still loading
  if (loading || isModulesLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Publish a module 
  const handlePublishModule = async (moduleId: string) => {
    if (!moduleId) {
      return;
    }
    const confirmPublish = confirm("Are you sure you want to publish this module?");
    if (!confirmPublish) return;
    try {
      // Update the module to be published
      const response = await fetch(`/api/modules/${moduleId}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: true }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to publish module");
      }
      // Refresh the modules list after publishing
      await fetchModules();
    } catch (error) {
      console.error("Error publishing module:", error);
    }
  };

  // Unpublish a module
  const handleUnpublishModule = async (moduleId: string) => {
    if (!moduleId) {
      return;
    }
    const confirmUnpublish = confirm("Are you sure you want to unpublish this module?");
    if (!confirmUnpublish) return;
    try {
      // Update the module to be unpublished
      const response = await fetch(`/api/modules/${moduleId}/publish`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: false }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unpublish module");
      }
      // Refresh the modules list after unpublishing
      await fetchModules();
    } catch (error) {
      console.error("Error unpublishing module:", error);
    }
  };
  
  return (
    <div className="flex">
      <Sidebar_dashboard />
      <div className="flex min-h-screen bg-gradient-to-t from-[#AAFF45]/15 to-white flex-1 pl-52 px-6">
        <CourseMenu 
        courseId={courseId as string}
        />
  
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h1 className="text-base font-medium">Professor Homepage</h1>
            <button
              onClick={() => setShowModulePopup(true)}
              className="p-2 mt-2 bg-[#AAFF45] text-black text-sm rounded hover:bg-[#B9FF66]"
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
                <div className="flex gap-2">
                {module.published ? (
                  <div className="relative group">
                    <img
                      src="/asset/publish_icon.svg"
                      alt="Published"
                      className="w-5 h-5 cursor-pointer"
                      onClick={() => handleUnpublishModule(module.id)}
                    />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100">
                      unpublish
                    </span>
                  </div>
                ) : (
                  <div className="relative group">
                    <img
                      src="/asset/unpublish_icon.svg"
                      alt="Unpublished"
                      className="w-5 h-5 cursor-pointer"
                      onClick={() => handlePublishModule(module.id)}
                    />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100">
                      publish
                    </span>
                  </div>
                )}
                <button onClick={() => handleEditModule(module.id)}>
                  <Image 
                  src="/asset/edit_icon.svg"
                  alt="Edit"
                  width={18}
                  height={18}
                  />
                </button>
                <button onClick={() => handleDeleteModule(module.id)}>
                  <Image
                  src="/asset/delete_icon.svg"
                  alt="Delete"
                  width={18}
                  height={18}
                  />
                </button>
                </div>
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
                  <div className="flex items-center gap-2">
                  <Image
                    src="/asset/file_icon.svg"
                    alt="Section"
                    width={16}
                    height={16}
                  />
                  {section.title}
                  </div>
                  <Image
                  src={
                    expandedRows[`section-${module.id}-${sectionIndex}`]
                    ? "/asset/arrowup_icon.svg"
                    : "/asset/arrowdown_icon.svg"
                  }
                  alt="Expand arrow"
                  width={12}
                  height={12}
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
                  <div className="flex items-center gap-2">
                  <Image
                    src="/asset/pdf_icon.svg"
                    alt="File"
                    width={16}
                    height={16}
                  />
                  {file.name}
                  </div>
                  <Image
                  src={
                    expandedRows[`file-${module.id}-${fileIndex}`]
                    ? "/asset/arrowup_icon.svg"
                    : "/asset/arrowdown_icon.svg"
                  }
                  alt="Expand arrow"
                  width={12}
                  height={12}
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
          onClose={() => {
            setShowModulePopup(false);
            setIsEditing(false);
            setSelectedModule(null);
          }}
          onSave={handleAddModule}
          initialData={selectedModule}
          isEditing={isEditing}
        />

        {/* Delete Confirmation Popup */}
        {showDeleteConfirmation && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
              <p className="mb-6 text-gray-700">Are you sure you want to delete this module? This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                setShowDeleteConfirmation(false);
                setModuleToDelete(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteModule}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
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