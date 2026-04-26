import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;
    const session = await auth();
    const userId = session?.user?.id ?? null;
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("ns_session_id")?.value;

    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: "asc" },
      include: {
        highlights: {
          include: {
            createdBy: {
              select: { id: true, name: true, image: true, username: true },
            },
            _count: { select: { upvotes: true } },
            upvotes: sessionId
              ? { where: { sessionId }, select: { id: true } }
              : false,
          },
        },
      },
    });

    // Shape highlights: add upvoteCount + userUpvoted, then sort
    const shaped = chapters.map((ch) => {
      const highlights = ch.highlights.map((h) => ({
        id: h.id,
        content: h.content,
        type: h.type,
        pageNumber: h.pageNumber,
        createdAt: h.createdAt,
        createdBy: h.createdBy,
        upvoteCount: h._count.upvotes,
        userUpvoted: sessionId ? (h.upvotes as { id: string }[]).length > 0 : false,
        isOwn: userId ? h.createdBy?.id === userId : false,
      }));

      // Sort: own highlights first, then by upvote count desc, then createdAt desc
      highlights.sort((a, b) => {
        if (a.isOwn && !b.isOwn) return -1;
        if (!a.isOwn && b.isOwn) return 1;
        if (b.upvoteCount !== a.upvoteCount) return b.upvoteCount - a.upvoteCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return { ...ch, highlights };
    });

    return NextResponse.json(shaped);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookId } = await params;
    const body = await req.json();
    const title = body?.title?.trim();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const lastChapter = await prisma.chapter.findFirst({
      where: { bookId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const chapter = await prisma.chapter.create({
      data: {
        title,
        order: (lastChapter?.order ?? 0) + 1,
        book: { connect: { id: bookId } },
      },
      include: {
        highlights: true,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error("Error creating chapter:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
