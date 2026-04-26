import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const tag = searchParams.get("tag");

    const books = await prisma.book.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search } },
                  { author: { contains: search } },
                ],
              }
            : {},
          tag
            ? {
                tags: {
                  some: {
                    tag: {
                      name: tag,
                    },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: { highlights: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedBooks = books.map((book) => ({
      ...book,
      tags: book.tags.map((t) => t.tag.name),
      highlightCount: book._count.highlights,
    }));

    return NextResponse.json(formattedBooks);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, author, coverImageUrl, tags } = body;

    if (!title || !author) {
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 });
    }

    const tagSlugs = Array.isArray(tags) ? tags.map((t: string) => t.toLowerCase().trim()) : [];

    const book = await prisma.book.create({
      data: {
        title,
        author,
        coverImageUrl: coverImageUrl || null,
        // No createdById — open to all
        tags: {
          create: tagSlugs.map((slug) => ({
            tag: {
              connectOrCreate: {
                where: { name: slug },
                create: { name: slug },
              },
            },
          })),
        },
      },
      include: {
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

    const formattedBook = {
      ...book,
      tags: book.tags.map((t) => t.tag.name),
      highlightCount: book._count.highlights,
    };

    return NextResponse.json(formattedBook, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
