"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

// Define the props for the FileUpload component
interface FileUploadProps {
  assignmentId: string;
  courseId: string;
  onUpload: (fileUrl: string, fileName: string) => void;
  isSubmission?: boolean; // New prop to indicate if this is a student submission
}

// Define the FileUpload component
const FileUpload: React.FC<FileUploadProps> = ({ 
  assignmentId, 
  courseId, 
  onUpload,
  isSubmission = false // Default to false (professor mode)
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false); // Add loading state

  // Handle file drop using react-dropzone
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 500 * 1024 * 1024) { // Limit file size to 500MB
        alert("File size exceeds the 500MB limit.");
        return;
      }
      setSelectedFile(file); // Set the first dropped file
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Handle file upload with conditional endpoint
  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true); // Set loading to true
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    // Different endpoints based on whether this is a submission or not
    const endpoint = isSubmission 
      ? `/api/courses/${courseId}/assignments/${assignmentId}/submissions`
      : `/api/courses/${courseId}/assignments/${assignmentId}/upload_file`;

    try {
      console.log(`Uploading file to ${endpoint}`);
      
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Upload response:", data);
        
        // Handle the response based on submission type
        if (isSubmission) {
          // For student submissions, we might get a different response format
          const fileUrl = data.submission?.fileUrl || data.fileUrl || "";
          const fileName = data.submission?.fileName || data.fileName || selectedFile.name;
          onUpload(fileUrl, fileName);
        } else {
          // For professor uploads
          onUpload(data.fileUrl, data.fileName);
        }
        setSelectedFile(null);
      } else {
        console.error("Upload failed:", await res.text());
        alert("File upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during upload:", error);
      alert("An error occurred during file upload.");
    } finally {
      setLoading(false); // Set loading to false after upload
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
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </div>

      {/* Selected File Name */}
      {selectedFile && (
        <div className="mt-2 flex items-center gap-4">
          <p className="text-gray-600">
            Selected File: <span className="font-semibold">{selectedFile.name}</span>
          </p>
          <button
            onClick={() => setSelectedFile(null)} // Clear the selected file
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Remove File
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
