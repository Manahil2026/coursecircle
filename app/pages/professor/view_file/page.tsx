"use client";

import { useSearchParams } from "next/navigation";
import FileViewer from "@/app/components/file_viewer";

const FileViewerPage = () => {
  const searchParams = useSearchParams();
  const fileUrl = searchParams.get("file");

  if (!fileUrl) {
    return <div className="text-center mt-10 text-red-500">No file selected.</div>;
  }

  return <FileViewer fileUrl={decodeURIComponent(fileUrl)} />;
};

export default FileViewerPage;
