import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: { highlights: true },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const formattedBook = {
      ...book,
      tags: book.tags.map((t) => t.tag.name),
      highlightCount: book._count.highlights,
      chapterCount: 0, // Placeholder as per instructions
    };

    return NextResponse.json(formattedBook);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    const { id } = await params;
    
    const book = await prisma.book.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // If the book was created by a specific user, only they can delete it
    if (book.createdById && book.createdById !== session?.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
