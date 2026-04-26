import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
