"use client";

import React from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

interface FileViewerProps {
  fileUrl: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl }) => {
  const docs = [{ uri: fileUrl }];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold mb-4">Document Viewer</h1>
      <div className="w-3/4 h-[80vh] border-2 border-gray-300 rounded-md shadow-lg bg-white">
        <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />
      </div>
    </div>
  );
};

export default FileViewer;
