import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: chapterId } = await params;
    const body = await req.json();
    const content = body?.content?.trim();
    const type = body?.type;
    const pageNumber = body?.pageNumber || null;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (!["QUOTE", "NOTE", "TAKEAWAY"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Verify chapter exists and get its bookId
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, bookId: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const highlightData: any = {
      content,
      type,
      pageNumber,
      chapter: { connect: { id: chapterId } },
      book: { connect: { id: chapter.bookId } },
    };

    if (session?.user?.id) {
      highlightData.createdBy = { connect: { id: session.user.id } };
    }

    const highlight = await prisma.highlight.create({
      data: highlightData,
      include: {
        createdBy: {
          select: { id: true, name: true, image: true, username: true },
        },
      },
    });

    return NextResponse.json(highlight, { status: 201 });
  } catch (error) {
    console.error("Error creating highlight:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
