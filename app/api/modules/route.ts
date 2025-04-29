// This API route handles the creation and retrieval of modules for a specific course.
// This file is called by the course homepage to fetch and create modules.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// GET - Fetch all modules for a course
export async function GET(req: Request) {
    try {
        const nextReq = new NextRequest(req);
        const { userId } = getAuth(nextReq);
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");

        if (!courseId) {
            return NextResponse.json({ error: "Missing courseId parameter" }, { status: 400 });
        }

        // Get user to determine role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        const isStudent = user?.role === "STUDENT";

        // For students, fetch only published modules with necessary fields
        if (isStudent) {
            const modules = await prisma.module.findMany({
                where: { 
                    courseId,
                    published: true // Only published modules for students
                },
                select: {
                    id: true,
                    title: true,
                    published: true,
                    sections: {
                        select: {
                            id: true,
                            title: true,
                            content: true
                        }
                    },
                    files: {
                        select: {
                            id: true,
                            name: true,
                            url: true,
                            type: true
                        }
                    }
                }
            });
            return NextResponse.json(modules);
        } 
        // For professors and admins, fetch all modules with complete data
        else {
            const modules = await prisma.module.findMany({
                where: { courseId },
                include: { sections: true, files: true },
            });
            return NextResponse.json(modules);
        }
    } catch (error) {
        console.error("Error fetching modules:", error);
        return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 });
    }
}

// POST - Create a new module
export async function POST(req: Request) {
    try {
        const { title, courseId, sections, files } = await req.json();

        if (!title || !courseId || !Array.isArray(sections) || !Array.isArray(files)) {
            return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
        }

        // Check if a module with the same title and courseId already exists
        const existingModule = await prisma.module.findFirst({
            where: {
                title: title,
                courseId: courseId,
            },
        });

        if (existingModule) {
            return NextResponse.json({ error: "Module with this title already exists in this course" }, { status: 400 });
        }

        // Proceed to create the new module if no duplicates found
        const newModule = await prisma.module.create({
            data: {
                title,
                courseId,
                sections: {
                    create: sections.map((section: { title: string; content: string }) => ({
                        title: section.title,
                        content: section.content,
                    })),
                },
                files: files.length
                    ? {
                        create: files.map((file: { name: string; url: string; type: string }) => ({
                            name: file.name,
                            url: file.url,
                            type: file.type,
                        })),
                    }
                    : undefined,
            },
        });

        return NextResponse.json(newModule, { status: 201 });
    } catch (error) {
        console.error("Error creating module:", error);
        return NextResponse.json({ error: "Failed to create module" }, { status: 500 });
    }
}
