
import { NextResponse } from "next/server";
let emails = [
    {
        id: 1,
        sender: "John Doe",
        subject: "Meeting Reminder",
        preview: "Don't forget our meeting at 3 PM...",
        time: "10:30 AM",
        isRead: false,
        isStarred: false
    },
    {
        id: 2,
        sender: "Jane Smith",
        subject: "Project Update",
        preview: "Here is the latest update on the project...",
        time: "11:15 AM",
        isRead: false,
        isStarred: false
    }
];
export async function GET() {
    return NextResponse.json(emails);
}
export async function PUT(req: Request) {
    const { searchParams } = new URL(req.url);
    const emailId = parseInt(searchParams.get("id") || "");
    const action = searchParams.get("action");
    const email = emails.find(e => e.id === emailId);
    if (!email) {
        return NextResponse.json({ message: "email not found"}, { status: 404});
    }
    if (action === "markAsRead") {
        email.isRead = true;
    } else if (action === "toggleStar") {
        email.isStarred = !email.isStarred;
    } else {
        return NextResponse.json({ message: "invalid action" }, { status: 400});
    }
    return NextResponse.json(email);
}