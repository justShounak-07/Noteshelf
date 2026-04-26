import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        createdAt: true,
        highlights: {
          include: {
            book: { select: { id: true, title: true, coverImageUrl: true } },
            chapter: { select: { id: true, title: true } },
            _count: { select: { upvotes: true } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const totalHighlights = user.highlights.length;
    const totalUpvotesReceived = user.highlights.reduce((acc, h) => acc + h._count.upvotes, 0);

    const booksMap = new Map();
    user.highlights.forEach(h => {
      if (!booksMap.has(h.book.id)) {
        booksMap.set(h.book.id, {
          id: h.book.id,
          title: h.book.title,
          coverImageUrl: h.book.coverImageUrl,
          contributionCount: 0
        });
      }
      booksMap.get(h.book.id).contributionCount += 1;
    });

    const booksContributedTo = Array.from(booksMap.values());

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        createdAt: user.createdAt,
      },
      stats: {
        totalHighlights,
        totalUpvotesReceived,
        booksContributedTo: booksContributedTo.length,
      },
      booksContributedTo,
      recentHighlights: user.highlights.slice(0, 10).map(h => ({
        id: h.id,
        content: h.content,
        type: h.type,
        pageNumber: h.pageNumber,
        upvoteCount: h._count.upvotes,
        book: { id: h.book.id, title: h.book.title },
        chapter: { id: h.chapter.id, title: h.chapter.title },
      }))
    });

  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
