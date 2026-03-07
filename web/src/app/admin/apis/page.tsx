import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin APIs",
};

const apis = [
  { method: "POST", path: "/api/admin/login", notes: "Admin sign-in (sets session cookie)." },
  { method: "POST", path: "/api/admin/logout", notes: "Admin sign-out (clears session cookie)." },
  { method: "POST", path: "/api/checkout", notes: "Creates order + Stripe checkout session." },
  { method: "POST", path: "/api/checkout/cart", notes: "Creates cart order + Stripe checkout session." },
  { method: "POST", path: "/api/contact", notes: "Stores/sends contact form submissions." },
  { method: "POST", path: "/api/webhooks/stripe", notes: "Stripe webhook for paid/cancelled status." },
];

export default function AdminApisPage() {
  return (
    <main className="admin-content mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-white/85 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Admin APIs
        </p>
        <h1 className="mt-2 text-4xl text-forest">API Endpoint Index</h1>
        <p className="mt-2 text-sm text-foreground/75">
          Quick reference for backend routes used by site and admin flows.
        </p>
      </header>

      <section className="mt-6 space-y-3">
        {apis.map((api) => (
          <article
            key={api.path}
            className="rounded-2xl border border-rose/20 bg-white/90 p-4 shadow-sm"
          >
            <p className="font-mono text-sm">
              <span className="mr-2 rounded bg-forest px-2 py-0.5 text-white">{api.method}</span>
              {api.path}
            </p>
            <p className="mt-2 text-sm text-foreground/75">{api.notes}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
