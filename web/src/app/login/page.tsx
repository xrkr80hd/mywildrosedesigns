import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login",
  description: "Admin login access for Wild Rose order dashboard.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <section className="rounded-3xl border border-rose/20 bg-white/90 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Login</p>
        <h1 className="mt-2 text-4xl text-forest">Admin Access</h1>
        <p className="mt-3 text-sm text-foreground/75">
          The admin dashboard uses secure basic authentication at the route level.
        </p>
        <Link
          href="/admin"
          className="mt-5 inline-flex rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white"
        >
          Continue to Admin
        </Link>
      </section>
    </main>
  );
}

