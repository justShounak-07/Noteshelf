import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("u");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ available: false });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    return NextResponse.json({ available: !user });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
