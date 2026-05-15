import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    const { id } = await params;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Allow deletion if user created the chapter, or if chapter has no creator
    if (chapter.createdById && chapter.createdById !== session?.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.chapter.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    const body = await req.json();
    const { title } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Allow editing if user created the chapter, or if chapter has no creator
    if (chapter.createdById && chapter.createdById !== session?.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.chapter.update({
      where: { id },
      data: { title: title.trim() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
