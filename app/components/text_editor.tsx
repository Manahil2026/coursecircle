'use client';

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css"; // Import Quill styles

interface ReactQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  toolbarOptions?: any;
}

const ReactQuillEditor: React.FC<ReactQuillEditorProps> = ({ value, onChange, height = "200px", toolbarOptions }) => {
  const defaultToolbarOptions = [
    [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['link', 'image', 'blockquote', 'code-block'],
    ['undo', 'redo'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'size': ['small', 'medium', 'large', 'huge'] }],
    [{ 'font': ['serif', 'monospace', 'sans-serif'] }],
    ['clean']
  ];

  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      theme="snow"
      modules={{
        toolbar: toolbarOptions || defaultToolbarOptions
      }}
      style={{ height: height, width: "100%" }}
    />
  );
};

export default ReactQuillEditor;
