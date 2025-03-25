"use client";

import React, { useState } from "react";

// Define the props for the FileUpload component
interface FileUploadProps {
  assignmentId: string;
  courseId: string;
  onUpload: (fileUrl: string, fileName: string) => void;
}

// Define the FileUpload component
const FileUpload: React.FC<FileUploadProps> = ({ assignmentId, courseId, onUpload }) => {
  // State to keep track of the selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file input change event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]); // Set the selected file to state
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) return; // If no file is selected, do nothing

    const formData = new FormData();
    formData.append("file", selectedFile); // Append the selected file to form data
    formData.append("assignmentId", assignmentId); // Append assignmentId to form data
    formData.append("courseId", courseId); // Append courseId to form data

    // Make a POST request to upload the file
    const res = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/upload_file`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json(); // Parse the response JSON
      onUpload(data.fileUrl, data.fileName); // Call the onUpload callback with file URL and name
      setSelectedFile(null); // Reset the selected file state
    } else {
      alert("File upload failed."); // Show an alert if the upload fails
    }
  };

  return (
    <div className="mb-6">
      {/* File input field */}
      <input type="file" onChange={handleFileChange} />
      {/* Upload button */}
      <button 
        onClick={handleUpload}
        className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 ml-2"
        disabled={!selectedFile} // Disable the button if no file is selected
      >
        Upload File
      </button>
    </div>
  );
};

export default FileUpload;
