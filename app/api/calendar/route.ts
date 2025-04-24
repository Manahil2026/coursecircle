// This API route handles calendar events, allowing for the creation, retrieval, updating, and deletion of events.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const body = await req.json();

  const start = new Date(body.start);
  const end = new Date(body.end);
  const date = new Date(start.toDateString()); // ensures only the date part is kept

  const event = await prisma.calendarEvent.create({
    data: {
      title: body.title,
      description: body.description,
      date,
      start,
      end,
      color: body.color,
      userId: body.userId,
    },
  });

  return NextResponse.json(event);
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await prisma.calendarEvent.findMany({
      where: {
        userId, // Filter events by the logged-in user's ID
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const body = await req.json();

  try {
    // Validate start and end fields
    if (!body.start || !body.end) {
      return NextResponse.json({ error: "Start and end times are required" }, { status: 400 });
    }

    // Construct start and end Date objects
    const start = new Date(body.start);
    const end = new Date(body.end);

    // Check if the constructed dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid start or end time" }, { status: 400 });
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: body.id },
      data: {
        title: body.title,
        description: body.description,
        date: new Date(body.date), // Ensure the date is a Date object
        start, // Use the validated start Date object
        end, // Use the validated end Date object
        color: body.color,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  await prisma.calendarEvent.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Event deleted successfully" });
}
