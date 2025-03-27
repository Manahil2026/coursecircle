"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import DocViewer to prevent SSR issues
const DocViewer = dynamic(() => import("react-doc-viewer"), { ssr: false });
import { DocViewerRenderers } from "react-doc-viewer";
import { GlobalWorkerOptions } from "pdfjs-dist";

// Manually set the path for the PDF worker
GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

interface FileViewerProps {
  fileUrl: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileUrl }) => {
  const [docs, setDocs] = useState<{ uri: string }[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function loadFile() {
      try {
        if (!fileUrl) return;
        await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay

        if (!signal.aborted) setDocs([{ uri: fileUrl }]);
      } catch (error) {
        if (error !== "AbortError") console.error("File loading error:", error);
      }
    }

    loadFile();

    return () => controller.abort();
  }, [fileUrl]);

  if (!docs) return <div>Loading document...</div>;

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
