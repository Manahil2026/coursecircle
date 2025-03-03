"use client";

import React, { useState } from "react";
import Image from "next/image";

interface InstructionsSectionProps {
  title: string;
  content: React.ReactNode;
  isExpanded: boolean;
  toggleExpand: (key: string) => void;
  sectionKey: string;
}

const InstructionsSection: React.FC<InstructionsSectionProps> = ({
  title,
  content,
  isExpanded,
  toggleExpand,
  sectionKey,
}) => {
  return (
    <div className="border border-gray-400 border-t-0 rounded-sm">
      <div
        className="flex justify-between items-center p-2 cursor-pointer"
        onClick={() => toggleExpand(sectionKey)}
      >
        {title}
        <Image
          src={
            isExpanded
              ? "/asset/arrowup_icon.svg"
              : "/asset/arrowdown_icon.svg"
          }
          alt="Expand arrow"
          width={16}
          height={16}
        />
      </div>
      {isExpanded && <div className="px-2 pb-2">{content}</div>}
    </div>
  );
};

interface CourseInstructionsProps {
  expandedRows: { [key: string]: boolean };
  toggleExpand: (key: string) => void;
}

const CourseInstructions: React.FC<CourseInstructionsProps> = ({
  expandedRows,
  toggleExpand,
}) => {
  const sections = [
    {
      key: "instruction-desc",
      title: "How to Add a Module",
      content: (
        <>
          <p className="mb-2">Follow these steps to create your first module:</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Click the "Add Module" button in the top right corner</li>
            <li>Fill in the required module title</li>
            <li>Add one or more sections with titles and content</li>
            <li>Upload one or more files with descriptions (optional)</li>
            <li>Click "Create Module" to save your new module</li>
          </ol>
        </>
      ),
    },
    {
      key: "instruction-features",
      title: "Module Features",
      content: (
        <>
          <p>Each module has the following features:</p>
          <ul className="list-disc ml-5 space-y-1 mt-2">
            <li>Multiple sections to organize content</li>
            <li>Multiple file attachments for course materials</li>
            <li>Expandable sections to show or hide content</li>
            <li>Delete option to remove unwanted modules</li>
          </ul>
        </>
      ),
    },
    {
      key: "instruction-tips",
      title: "Tips",
      content: (
        <p>
          Use clear, descriptive titles and thorough descriptions to help
          students understand module content. Organize related materials in
          separate sections to improve navigation. This instruction table will
          disappear once you create your first module.
        </p>
      ),
    },
  ];

  return (
    <div className="w-full mt-4">
      <div className="mb-6 text-sm">
        {/* Title Section */}
        <div className="bg-[#AAFF45] border border-gray-400 p-2 rounded-t-sm">
          Getting Started with Modules
        </div>

        {/* Instruction Sections */}
        {sections.map((section, index) => (
          <InstructionsSection
            key={section.key}
            sectionKey={section.key}
            title={section.title}
            content={section.content}
            isExpanded={!!expandedRows[section.key]}
            toggleExpand={toggleExpand}
          />
        ))}

        {/* Add rounded bottom to the last section */}
        <div className="border-t-0 rounded-b-sm h-1"></div>
      </div>
    </div>
  );
};

export default CourseInstructions;