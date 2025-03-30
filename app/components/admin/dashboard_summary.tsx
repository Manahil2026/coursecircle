import React from "react";

const DashboardSummary: React.FC = () => {
  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-black">Welcome</h2>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-md border border-gray-300">
            Dev Preview - Milestone 2 Pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-5 rounded border border-black flex items-center justify-between hover:shadow-lg hover:border-gray-500 transition">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Courses</p>
            <p className="text-2xl font-bold text-black">20</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-300">
            <img src="/asset/courses_icon.svg" alt="Courses Icon" className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded border border-black flex items-center justify-between hover:shadow-lg hover:border-gray-500 transition">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
            <p className="text-2xl font-bold text-black">100</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-300">
            <img src="/asset/student_icon.svg" alt="Students Icon" className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded border border-black flex items-center justify-between hover:shadow-lg hover:border-gray-500 transition">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Professors</p>
            <p className="text-2xl font-bold text-black">15</p>
          </div>
          <div className="p-3 rounded-lg border border-gray-300">
            <img src="/asset/student_icon.svg" alt="Professors Icon" className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded border border-black flex items-center justify-between hover:shadow-lg hover:border-gray-500 transition">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Database</p>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-lg font-bold text-black">Online</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-gray-300">
            <img src="/asset/database_icon.svg" alt="Database Icon" className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded border border-black flex items-center justify-between hover:shadow-lg hover:border-gray-500 transition">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Authentication</p>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-lg font-bold text-black">Active</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-gray-300">
            <img src="/asset/lock_icon.svg" alt="Lock Icon" className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded border border-black flex items-center justify-between hover:shadow-lg hover:border-gray-500 transition">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Storage</p>
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1 border border-gray-300">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "42%" }}></div>
              </div>
              <span className="text-lg font-bold text-black">42% Used</span>
            </div>
          </div>
          <div className="p-3 rounded-lg border border-gray-300">
            <img src="/asset/storage_icon.svg" alt="Storage Icon" className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
