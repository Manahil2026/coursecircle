import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Course {
  id: string;
  name: string;
  code: string;
}

interface AnnouncementModalProps {
  onClose: () => void;
  courses: Course[];
  onSuccess?: (conversationId: string) => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  onClose,
  courses = [],
  onSuccess
}) => {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courseInfo, setCourseInfo] = useState<{ id: string; name: string; code: string } | null>(null);
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  
  // Update group name when course changes
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        setCourseInfo(course);
        setGroupName(course.code);
      }
    } else {
      setCourseInfo(null);
      setGroupName("");
    }
  }, [selectedCourse, courses]);

  // Fetch students when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      fetch(`/api/courses/${selectedCourse}`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch course");
          return res.json();
        })
        .then(data => {
          if (data.students && Array.isArray(data.students)) {
            setStudents(data.students);
          } else {
            setStudents([]);
          }
        })
        .catch(err => {
          console.error("Error fetching students:", err);
          setError("Failed to load students. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  }, [selectedCourse]);

  const handleSendAnnouncement = async () => {
    if (!selectedCourse) {
      setError("Please select a course");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    if (students.length === 0) {
      setError("No students found in this course");
      return;
    }

    setSending(true);
    setError("");

    try {
      // Create the conversation with all students
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: students.map(student => student.id),
          name: groupName || courseInfo?.code || "Class Announcement",
          isGroup: true,
          courseId: selectedCourse
        }),
      });

      if (!conversationResponse.ok) {
        throw new Error("Failed to create announcement");
      }

      const conversation = await conversationResponse.json();
      
      // Send the announcement message
      const messageResponse = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          isDraft: false
        }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to send announcement");
      }

      // Handle success
      if (onSuccess) {
        onSuccess(conversation.id);
      } else {
        router.push(`/pages/inbox/${conversation.id}`);
      }
      
      onClose();
    } catch (err) {
      console.error("Error creating announcement:", err);
      setError("Failed to send announcement. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Class Announcement</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <img src="/asset/close_icon.svg" alt="Close" className="w-6 h-6" />
          </button>
        </div>

        {/* Course selection */}
        <div className="mb-4">
          <label htmlFor="courseSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Select Course:
          </label>
          <select
            id="courseSelect"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
          >
            <option value="">-- Select a course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Group name */}
        <div className="mb-4">
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
            Announcement Group Name:
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
            placeholder="Enter group name..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Defaults to course code. This will be the name of the conversation thread.
          </p>
        </div>

        {/* Students display */}
        {selectedCourse && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipients:
            </label>
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-4 border-t-[#AAFF45] border-[#d1e3bb] rounded-full animate-spin"></div>
              </div>
            ) : students.length > 0 ? (
              <div className="border rounded-md p-2 max-h-20 overflow-y-auto bg-gray-50">
                <p className="text-sm text-gray-600">
                  This announcement will be sent to all {students.length} students enrolled in {courseInfo?.code}.
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-500">No students found in this course.</p>
            )}
          </div>
        )}

        {/* Message input */}
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Announcement Message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
            rows={5}
            placeholder="Type your announcement here..."
          ></textarea>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 text-red-500 text-sm">{error}</div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSendAnnouncement}
            disabled={sending || !selectedCourse || !message.trim()}
            className={`px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-[#8FE03D] ${
              (sending || !selectedCourse || !message.trim()) ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {sending ? "Sending..." : "Send Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
