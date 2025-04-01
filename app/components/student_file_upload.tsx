"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

// Define props for student submission
interface StudentFileUploadProps {
  assignmentId: string;
  courseId: string;
  onUpload: (fileUrl: string, fileName: string) => void;
}

const StudentFileUpload: React.FC<StudentFileUploadProps> = ({ 
  assignmentId, 
  courseId, 
  onUpload 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle file drop using react-dropzone
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 500 * 1024 * 1024) { // Limit file size to 500MB
        alert("File size exceeds the 500MB limit.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Handle file upload - specifically for student submissions
  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
      // Submissions-specific endpoint
      const res = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submissions`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        
        // Handle submission-specific response format
        const fileUrl = data.submission?.fileUrl || "";
        const fileName = data.submission?.fileName || selectedFile.name;
        
        onUpload(fileUrl, fileName);
        setSelectedFile(null);
      } else {
        console.error("Upload failed:", await res.text());
        alert("File upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      alert("An error occurred during file submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      {/* Drag-and-Drop Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-6 text-center cursor-pointer transition ${
          isDragActive ? "border-[#A8FF00] bg-gray-100" : "border-gray-300 bg-gray-50"
        }`}
        aria-label="Drag and drop a file here, or click to select a file"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-[#A8FF00]">Drop the file here...</p>
        ) : (
          <p className="text-gray-600">Drag and drop a file here, or click to select a file</p>
        )}
      </div>

      {/* Upload Button */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleUpload}
          className={`bg-[#B9FF66] text-black px-4 py-1 rounded hover:bg-[#A8FF00] ${
            !selectedFile || loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!selectedFile || loading}
        >
          {loading ? "Submitting..." : "Submit Assignment"}
        </button>
      </div>

      {/* Selected File Name */}
      {selectedFile && (
        <div className="mt-2 flex items-center gap-4">
          <p className="text-gray-600">
            Selected File: <span className="font-semibold">{selectedFile.name}</span>
          </p>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove File
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentFileUpload;
