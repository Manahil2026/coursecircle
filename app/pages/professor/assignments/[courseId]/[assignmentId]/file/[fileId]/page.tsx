"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import FileViewer from "@/app/components/file_viewer";

interface AssignmentFile {
  id: string;
  fileName: string;
  fileUrl: string;
}

export default function AssignmentFilePage() {
  const params = useParams() as { courseId: string; assignmentId: string; fileId: string };
  const { fileId } = params;
  const [file, setFile] = useState<AssignmentFile | null>(null);

  useEffect(() => {
    if (fileId) {
      fetch(`/api/assignment-files/${fileId}`)
        .then((res) => res.json())
        .then((data) => setFile(data))
        .catch((error) => console.error("Error fetching file:", error));
    }
  }, [fileId]);

  if (!file) {
    return <div>Loading file...</div>;
  }

  return <FileViewer fileUrl={file.fileUrl} />;
}
