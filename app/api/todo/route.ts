// This api route handles CRUD operations for todo list.
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(todos);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { content, dueDate, dueTime } = await req.json();
  const todo = await prisma.todo.create({
    data: {
      userId,
      content,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime: dueTime || null,
    },
  });

  return NextResponse.json(todo);
}

export async function PUT(req: Request) {
  const { id, content, dueDate, dueTime } = await req.json();
  const updated = await prisma.todo.update({
    where: { id },
    data: {
      content,
      dueDate: dueDate ? new Date(dueDate) : null,
      dueTime: dueTime || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const deleted = await prisma.todo.delete({
    where: { id },
  });

  return NextResponse.json(deleted);
}
