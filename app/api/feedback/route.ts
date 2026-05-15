import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { message, userEmail } = await req.json();

    if (!message || message.trim().length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }

    // Save to database
    await prisma.feedback.create({
      data: {
        message: message.trim(),
        userEmail: userEmail || null,
      },
    });

    // Send email notification if credentials are configured
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        await transporter.sendMail({
          from: `"NoteShelf Feedback" <${emailUser}>`,
          to: "shounakpal.dev@gmail.com",
          subject: `📚 New NoteShelf Feedback${userEmail ? ` from ${userEmail}` : ""}`,
          text: `New feedback received:\n\n${message.trim()}\n\n---\nFrom: ${userEmail || "Anonymous user"}\nTime: ${new Date().toISOString()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #D4AF37;">📚 New NoteShelf Feedback</h2>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; border-left: 4px solid #D4AF37;">
                <p style="white-space: pre-wrap; margin: 0;">${message.trim()}</p>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 16px;">
                <strong>From:</strong> ${userEmail || "Anonymous user"}<br/>
                <strong>Time:</strong> ${new Date().toLocaleString()}
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // Log but don't fail the request if email sending fails
        console.error("Failed to send feedback email:", emailError);
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
