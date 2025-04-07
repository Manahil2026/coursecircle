'use client';
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PeopleTable from "@/app/components/peopleTable";
import Sidebar_dashboard from "@/app/components/sidebar_dashboard";
import CourseMenu from "@/app/components/course_menu";

const PeoplePage = () => {
    const { courseId } = useParams();

    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseId) return;

        const fetchPeople = async () => {
            try {
                const response = await fetch(`/api/people?courseId=${courseId}`);
                const data = await response.json();
                setPeople(data);
            } catch (error) {
                console.error("Error fetching people:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPeople();
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-8 border-t-[#d1e3bb] border-[#73b029] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-1/5  h-full flex-shrink-0">
                <Sidebar_dashboard />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Course Menu */}
                <div className="bg-white shadow-md">
                    <CourseMenu courseId={courseId as string} />
                </div>

                {/* Page Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-6">People</h1>
                    <PeopleTable people={people} />
                </div>
            </div>
        </div>
    );
};

export default PeoplePage;