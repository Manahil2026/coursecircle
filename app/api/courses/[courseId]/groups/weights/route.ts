// filepath:/app/api/courses/[courseId]/groups/weights/route.ts
// This api route is to add weight to assignment groups.
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params;
    const { weights } = await req.json(); // Expect an array of { groupId, weight }

    if (!weights || !Array.isArray(weights)) {
      return NextResponse.json({ error: "Invalid weights payload" }, { status: 400 });
    }

    // Update weights for each group
    for (const { groupId, weight } of weights) {
      console.log(`Processing groupId=${groupId}, weight=${weight}`);
      if (!groupId || typeof groupId !== "string" || typeof weight !== "number" || isNaN(weight)) {
        console.warn(`Invalid groupId or weight: groupId=${groupId}, weight=${weight}`);
        return NextResponse.json({ error: "Invalid groupId or weight in payload" }, { status: 400 });
      }

      await prisma.assignmentGroup.update({
        where: { id: groupId },
        data: { weight },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating group weights:", error);
    return NextResponse.json({ error: "Failed to update group weights" }, { status: 500 });
  }
}