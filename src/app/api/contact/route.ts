import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, website } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      website?: string; // honeypot field
    };

    // Simple honeypot — bots tend to fill every field.
    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${siteConfig.name} Contact Form <onboarding@resend.dev>`,
          to: siteConfig.contactEmail,
          reply_to: email,
          subject: `[Contact] ${subject}`,
          text: `From: ${name} <${email}>\n\n${message}`,
        }),
      });
      if (!res.ok) {
        console.error("Contact email failed to send:", await res.text());
        return NextResponse.json({ error: "We couldn't send your message right now. Please try again shortly." }, { status: 502 });
      }
    } else {
      // No email provider configured yet — log server-side so the message isn't lost silently.
      // Set RESEND_API_KEY (or wire up another provider in this route) to deliver messages by email.
      console.log("Contact form submission (no email provider configured):", { name, email, subject, message });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
