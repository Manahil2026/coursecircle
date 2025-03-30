"use client";

import React, { useRef, useEffect, useState } from "react";

interface FileViewerProps {
  fileUrl: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string>(fileUrl);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  useEffect(() => {
    const checkAndConvertFile = async () => {
      const fileExtension = fileUrl.split(".").pop()?.toLowerCase();

      if (fileExtension !== "pdf") {
        try {
          setIsConverting(true);
          const response = await fetch(`/api/convert?fileUrl=${encodeURIComponent(fileUrl)}`);
          const data = await response.json();

          if (response.ok && data.pdfUrl) {
            setDisplayUrl(data.pdfUrl);
          } else {
            console.error("Failed to convert file:", data.error);
          }
        } catch (error) {
          console.error("Error during conversion:", error);
        } finally {
          setIsConverting(false);
        }
      } else {
        setDisplayUrl(fileUrl);
      }
    };

    checkAndConvertFile();
  }, [fileUrl]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = displayUrl;
    }
  }, [displayUrl]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold mb-4">Document Viewer</h1>
      <div className="w-3/4 h-[80vh] border-2 border-gray-300 rounded-md shadow-lg bg-white overflow-hidden">
        {isConverting ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg font-medium text-gray-500">Converting file to PDF...</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={displayUrl}
            className="w-full h-full"
            title="File Viewer"
          ></iframe>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
