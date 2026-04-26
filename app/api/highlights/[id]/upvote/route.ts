import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("ns_session_id")?.value;

    if (!sessionId) {
      sessionId = randomUUID();
      cookieStore.set("ns_session_id", sessionId, {
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        path: "/",
      });
    }

    const { id: highlightId } = await params;

    const highlight = await prisma.highlight.findUnique({ where: { id: highlightId } });
    if (!highlight) {
      return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
    }

    const existing = await prisma.upvote.findUnique({
      where: { highlightId_sessionId: { highlightId, sessionId } },
    });

    if (existing) {
      // Un-upvote
      await prisma.upvote.delete({ where: { id: existing.id } });
    } else {
      // Upvote
      await prisma.upvote.create({ data: { highlightId, sessionId } });
    }

    const count = await prisma.upvote.count({ where: { highlightId } });

    return NextResponse.json({ upvoted: !existing, count });
  } catch (error) {
    console.error("Upvote error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
