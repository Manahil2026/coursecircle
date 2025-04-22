import React, { useState } from "react";
import { useRouter } from "next/navigation";
import UserSearchSelect from "./UserSearchSelect";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface NewConversationModalProps {
  onClose: () => void;
  courses?: Course[];
  onSuccess?: (conversationId: string) => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  onClose,
  courses = [],
  onSuccess
}) => {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleSendMessage = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one recipient");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSending(true);
    setError("");

    try {
      // First create the conversation
      const conversationResponse = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: selectedUsers.map(user => user.id),
          name: isGroup ? groupName : undefined,
          isGroup,
          courseId: selectedCourse || undefined
        }),
      });

      if (!conversationResponse.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation = await conversationResponse.json();
      
      // Then send the initial message
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
        throw new Error("Failed to send message");
      }

      // Handle success
      if (onSuccess) {
        onSuccess(conversation.id);
      } else {
        router.push(`/pages/inbox/${conversation.id}`);
      }
      
      onClose();
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Message</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <img src="/asset/close_icon.svg" alt="Close" className="w-6 h-6" />
          </button>
        </div>

        {/* Recipients */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To:
          </label>
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div key={user.id} className="bg-[#AAFF45] text-black rounded-md px-3 py-1 text-sm flex items-center gap-1">
                <span>{user.firstName} {user.lastName}</span>
                <button onClick={() => handleRemoveUser(user.id)} className="ml-1 text-black hover:text-gray-700">
                  <img src="/asset/close_icon.svg" alt="Remove" className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <UserSearchSelect
            onSelect={handleSelectUser}
            selectedUsers={selectedUsers}
            placeholder="Search for recipients..."
          />
        </div>

        {/* Group chat options */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="isGroup"
              checked={isGroup}
              onChange={(e) => setIsGroup(e.target.checked)}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label htmlFor="isGroup" className="ml-2 block text-sm text-gray-700">
              Create as group conversation
            </label>
          </div>

          {isGroup && (
            <div className="mt-2">
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name:
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
                placeholder="Enter group name..."
              />
            </div>
          )}
        </div>

        {/* Course selection for contextualized messaging */}
        {courses.length > 0 && (
          <div className="mb-4">
            <label htmlFor="courseContext" className="block text-sm font-medium text-gray-700 mb-1">
              Related Course (optional):
            </label>
            <select
              id="courseContext"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
            >
              <option value="">None</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Message input */}
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#AAFF45]"
            rows={5}
            placeholder="Type your message here..."
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
            onClick={handleSendMessage}
            disabled={sending}
            className={`px-4 py-2 bg-[#AAFF45] text-black rounded-md hover:bg-[#8FE03D] ${
              sending ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
