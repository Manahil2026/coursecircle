"use client";
import React, { useState, useEffect } from "react";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";
import { useParams } from "next/navigation";
import Image from "next/image";

// Interface for the module data from the API
interface Module {
  id: string;
  title: string;
  sections: { title: string; content: string }[];
  files: { name: string; url: string; type: string }[];
  published: boolean;
}

const Coursepage: React.FC = () => {
  const params = useParams();
  const courseId = params?.courseId as string;
  
  // State for modules
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  // Fetch published modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/modules?courseId=${courseId}`);
        if (!response.ok) throw new Error("Failed to fetch modules");
        const data = await response.json();
        // Filter to only show published modules
        const publishedModules = data.filter((module: Module) => module.published);
        setModules(publishedModules);
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchModules();
    }
  }, [courseId]);

  // Toggle function for expanding/collapsing sections
  const toggleExpand = (key: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="flex bg-gradient-to-t from-[#AAFF45]/15 to-white">
      <Sidebar_dashboard />
      <CourseMenu courseId={courseId} />
      <main className="min-h-screen flex-1 p-6 pl-52">    
        {/* Modules Section */}
        {isLoading ? (
          <div className="flex justify-center mt-6">
            <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
          </div>
        ) : modules.length === 0 ? (
          <p className="mt-6">No course materials available yet.</p>
        ) : (
          <div className="">
            <h2 className="text-base font-medium mb-4">Course Materials</h2>
            {modules.map((module) => (
              <div key={module.id} className="mb-6 text-sm">
                <div className="bg-[#AAFF45] border border-gray-400 p-2 rounded-t-sm">
                  {module.title}
                </div>

                {/* Module Sections */}
                {module.sections.map((section, sectionIndex) => (
                  <div
                    key={`section-${module.id}-${sectionIndex}`}
                    className="border border-gray-400 border-t-0 rounded-sm"
                  >
                    <div
                      className="flex justify-between items-center p-2 cursor-pointer"
                      onClick={() => toggleExpand(`section-${module.id}-${sectionIndex}`)}
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
                      <div className="p-2 bg-gray-100">{section.content}</div>
                    )}
                  </div>
                ))}

                {/* Module Files */}
                {module.files.map((file, fileIndex) => (
                  <div
                    key={`file-${module.id}-${fileIndex}`}
                    className="border border-gray-400 border-t-0 rounded-sm"
                  >
                    <div className="flex justify-between items-center p-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/asset/pdf_icon.svg"
                          alt="File"
                          width={16}
                          height={16}
                        />
                        <a 
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {file.name}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty bottom border for the last item */}
                <div className="border-t-0 rounded-b-sm h-1"></div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Coursepage;
