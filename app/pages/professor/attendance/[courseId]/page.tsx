'use client';
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";


interface Student {
    id: string;
    firstName: string;
    lastName: string;
    status: string; // "PRESENT", "ABSENT", "UNMARKED"
}

export default function AttendancePage() {
    const { courseId } = useParams();
    console.log("Frontend courseId:", courseId);

    const [students, setStudents] = useState<Student[]>([]);
    const [date, setDate] = useState<string>(
        new Date().toLocaleDateString("en-CA") // Local date in YYYY-MM-DD format
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [professorId, setProfessorId] = useState<string | null>(null); // Add professorId state

    // Fetch students and attendance records for the selected date
    useEffect(() => {
        if (!courseId) {
            console.error("courseId is missing");
            return;
        }

        async function fetchAttendance() {
            try {
                const response = await fetch(`/api/courses/${courseId}/attendance?date=${date}`);
                if (!response.ok) throw new Error("Failed to fetch attendance records");

                const data = await response.json();

                // Access the attendanceRecords array and map it to students
                setStudents(
                    data.attendanceRecords.map((record: any) => ({
                        id: record.student.id,
                        firstName: record.student.firstName,
                        lastName: record.student.lastName,
                        status: record.status || "UNMARKED",
                    }))
                );

                // Set the professorId
                setProfessorId(data.professorId);
            } catch (err: any) {
                setError(err.message);
            }
        }

        fetchAttendance();
    }, [courseId, date]);

    // Handle attendance status toggle
    const toggleStatus = (studentId: string) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === studentId
                    ? {
                        ...student,
                        status:
                            student.status === "PRESENT"
                                ? "ABSENT"
                                : student.status === "ABSENT"
                                    ? "UNMARKED"
                                    : "PRESENT",
                    }
                    : student
            )
        );
    };

    // Save attendance
    const saveAttendance = async () => {
        if (!professorId) {
            setError("Professor ID is missing");
            return;
        }

        setLoading(true);
        setError(null);

        const utcDate = new Date(date).toISOString(); // Convert local date to UTC
        console.log("Saving attendance for UTC date:", utcDate);

        try {
            const response = await fetch(`/api/courses/${courseId}/attendance`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId,
                    professorId, // Use the correct professorId
                    date: utcDate, // Send UTC date to the backend
                    attendance: students.map(({ id, status }) => ({
                        studentId: id,
                        status,
                    })),
                }),
            });

            if (!response.ok) throw new Error("Failed to save attendance");

            alert("Attendance saved successfully!");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-1/5 h-full flex-shrink-0">
                <Sidebar_dashboard />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Course Menu */}
                <div className="bg-white shadow-md">
                    <CourseMenu courseId={courseId as string} />
                </div>

                {/* Attendance Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <h1 className="text-base font-medium mb-6">Attendance for {date}</h1>
                    <label className="block mb-4">
                        Select Date:
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="ml-2 p-2 border rounded"
                        />
                    </label>
                    {error && <p className="text-red-500 mt-2">{error}</p>}

                    <table className="table-auto w-3/4 border-collapse border border-gray-300 mt-4">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Student Name</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Attendance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">
                                        {student.firstName} {student.lastName}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={student.status === "PRESENT"}
                                            onChange={() => toggleStatus(student.id)}
                                            className="w-5 h-5 rounded border-gray-300 text-[#AAFF45] focus:ring-[#AAFF45]"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        onClick={saveAttendance}
                        disabled={loading}
                        className={`mt-4 px-6 py-2 rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#AAFF45] hover:bg-[#94db3d] text-black"
                            }`}
                    >
                        {loading ? "Saving..." : "Save Attendance"}
                    </button>
                </div>
            </div>
        </div>
    );
}