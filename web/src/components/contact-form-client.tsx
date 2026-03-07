"use client";

import { FormEvent, useState } from "react";

type ContactResult = {
  error?: string;
  success?: boolean;
};

export function ContactFormClient() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as ContactResult;

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to send message right now.");
      }

      setStatus({
        ok: true,
        message: "Thanks. Your message was sent and we will follow up soon.",
      });
      form.reset();
    } catch (error) {
      setStatus({
        ok: false,
        message: error instanceof Error ? error.message : "Failed to send message.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-rose/20 bg-white/90 p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-semibold text-forest">Name</span>
          <input
            name="name"
            required
            className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm font-semibold text-forest">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
          />
        </label>
      </div>
      <label className="mt-4 block space-y-1">
        <span className="text-sm font-semibold text-forest">Subject</span>
        <input
          name="subject"
          required
          className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
        />
      </label>
      <label className="mt-4 block space-y-1">
        <span className="text-sm font-semibold text-forest">Message</span>
        <textarea
          name="message"
          rows={6}
          required
          className="w-full rounded-xl border border-rose/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-rose"
        />
      </label>

      {status ? (
        <p className={`mt-4 text-sm font-semibold ${status.ok ? "text-green-700" : "text-red-700"}`}>
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-xl bg-rose px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
