"use client";

import React, { useRef, useEffect } from "react";

interface FileViewerProps {
  fileUrl: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = fileUrl;
    }
  }, [fileUrl]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold mb-4">Document Viewer</h1>
      <div className="w-3/4 h-[80vh] border-2 border-gray-300 rounded-md shadow-lg bg-white overflow-hidden">
        <iframe
          ref={iframeRef}
          src={fileUrl}
          className="w-full h-full"
          title="File Viewer"
        ></iframe>
      </div>
    </div>
  );
};

export default FileViewer;
