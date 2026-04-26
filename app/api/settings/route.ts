import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, username } = await req.json();

    if (!username || username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    // Check if username is taken by someone else
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: "Username taken" }, { status: 409 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        username,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
      }
    });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
