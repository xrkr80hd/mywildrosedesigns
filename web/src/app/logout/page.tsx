"use client";

import Link from "next/link";
import { useState } from "react";

export default function LogoutPage() {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setStatus("done");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <section className="rounded-3xl border border-rose/20 bg-white/90 p-7">
        <h1 className="text-4xl text-forest">Signed Out</h1>
        <p className="mt-3 text-sm text-foreground/75">
          End admin session cookie here.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl bg-rose px-5 py-2.5 text-sm font-semibold text-white"
          >
            {status === "done" ? "Signed Out" : "Sign Out Admin Session"}
          </button>
          <Link
            href="/"
            className="rounded-xl border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest"
          >
            Back to Home
          </Link>
          <Link
            href="/admin"
            className="rounded-xl border border-forest/25 px-5 py-2.5 text-sm font-semibold text-forest"
          >
            Re-open Admin
          </Link>
        </div>
      </section>
    </main>
  );
}
