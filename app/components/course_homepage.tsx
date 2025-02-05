import React, { useState } from "react";

interface Module {
  id: number;
  title: string;
  description: string;
  files: string[];
}

const CourseHomepage: React.FC = () => {
  const [courseIntroduction, setCourseIntroduction] = useState<string>("");
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleTitle, setModuleTitle] = useState<string>("");
  const [moduleDescription, setModuleDescription] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles([...uploadedFiles, ...Array.from(event.target.files)]);
    }
  };

  const handleAddModule = () => {
    const newModule = {
      id: modules.length + 1,
      title: moduleTitle,
      description: moduleDescription,
      files: uploadedFiles.map((file) => file.name),
    };

    setModules([...modules, newModule]);
    setModuleTitle("");
    setModuleDescription("");
    setUploadedFiles([]);
  };

  const handleDeleteModule = (id: number) => {
    setModules(modules.filter((module) => module.id !== id));
  };

  const handleEditModule = (id: number) => {
    const moduleToEdit = modules.find((module) => module.id === id);
    if (moduleToEdit) {
      setModuleTitle(moduleToEdit.title);
      setModuleDescription(moduleToEdit.description);
      setUploadedFiles([]);
      handleDeleteModule(id);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Course Homepage</h1>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Course Introduction:</label>
        <textarea
          value={courseIntroduction}
          onChange={(e) => setCourseIntroduction(e.target.value)}
          placeholder="Write an introduction to your course here..."
          className="w-full p-2 border rounded-md"
          rows={5}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Manage Modules</h2>
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">Module Title:</label>
          <input
            type="text"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            placeholder="Enter module title"
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">Module Description:</label>
          <textarea
            value={moduleDescription}
            onChange={(e) => setModuleDescription(e.target.value)}
            placeholder="Enter module description"
            className="w-full p-2 border rounded-md"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">Upload Files:</label>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="w-full p-2 border rounded-md"
          />
          <div className="mt-2">
            {uploadedFiles.length > 0 && (
              <ul>
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          onClick={handleAddModule}
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Add Module
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Modules List</h2>
        {modules.length === 0 ? (
          <p>No modules added yet.</p>
        ) : (
          <ul>
            {modules.map((module) => (
              <li key={module.id} className="mb-4 border p-4 rounded-md shadow-md">
                <h3 className="text-xl font-bold">{module.title}</h3>
                <p>{module.description}</p>
                <div className="mt-2">
                  <h4 className="font-medium">Files:</h4>
                  <ul>
                    {module.files.map((file, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {file}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2">
                  <button
                    onClick={() => handleEditModule(module.id)}
                    className="bg-yellow-500 text-white py-1 px-3 rounded-md mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="bg-red-500 text-white py-1 px-3 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CourseHomepage;
