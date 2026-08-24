"use client";

import { useState, FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      subject: String(data.get("subject") || ""),
      message: String(data.get("message") || ""),
      website: String(data.get("website") || ""), // honeypot
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="card flex items-center gap-3 p-6">
        <CheckCircle2 className="text-[var(--color-success)]" size={22} />
        <p className="text-sm text-[var(--color-text)]">Thanks — your message has been sent. We&apos;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      {error && <ErrorMessage message={error} />}
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Name</label>
        <input id="contact-name" name="name" required className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus-ring outline-none" />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Email</label>
        <input id="contact-email" name="email" type="email" required className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus-ring outline-none" />
      </div>
      <div>
        <label htmlFor="contact-subject" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Subject</label>
        <input id="contact-subject" name="subject" required className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus-ring outline-none" />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Message</label>
        <textarea id="contact-message" name="message" required rows={5} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm focus-ring outline-none" />
      </div>
      <button type="submit" disabled={status === "sending"} className="btn-primary px-5 py-3 text-sm">
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
