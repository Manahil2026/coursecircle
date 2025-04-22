'use client';

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css"; // Import Quill styles
import { Quill } from "react-quill-new";

interface ReactQuillEditorProps {
  value: string;
  onChange?: (value: string) => void;
  height?: string;
  toolbarOptions?: any;
  readOnly?: boolean;
}


const ReactQuillEditor: React.FC<ReactQuillEditorProps> = ({ value, onChange = () => {}, height = "200px", toolbarOptions, readOnly = false, }) => {
  const defaultToolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
  
    // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'align': [] }],
  
    ['clean']                                         // remove formatting button
  ];
  

  return (
    <ReactQuill
      value={value}
      onChange={onChange}
      theme="snow"
      readOnly={readOnly}
      modules={{
        toolbar: toolbarOptions || defaultToolbarOptions
      }}
      style={{ height: height, width: "100%" }}
    />
  );
};

export default ReactQuillEditor;
