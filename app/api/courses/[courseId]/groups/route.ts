import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

interface Params {
  params: { courseId: string };
}

export async function POST(req: NextRequest, { params }: Params) { // Create or edit a group
  const { courseId } = params;
  const { name, groupId } = await req.json();

  if (groupId) {
    const updatedGroup = await prisma.assignmentGroup.update({
      where: { id: groupId },
      data: { name },
    });
    return NextResponse.json(updatedGroup);
  }

  const newGroup = await prisma.assignmentGroup.create({
    data: { name, courseId },
  });

  return NextResponse.json(newGroup);
}

export async function DELETE(req: NextRequest) { // Delete a group
  const { groupId } = await req.json();

  const assignments = await prisma.assignment.findMany({ where: { groupId } });
  if (assignments.length > 0) {
    return NextResponse.json({ error: "Group is not empty" }, { status: 400 });
  }

  await prisma.assignmentGroup.delete({ where: { id: groupId } });

  return NextResponse.json({ message: "Group deleted" });
}
