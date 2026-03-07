import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <section className="w-full rounded-3xl border border-rose/20 bg-surface p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Checkout Cancelled
        </p>
        <h1 className="mt-3 text-4xl text-forest">No payment was completed.</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-foreground/75">
          Your design upload is still saved. You can return and retry checkout when
          ready.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-rose px-5 py-3 text-sm font-semibold text-white hover:bg-rose/90"
        >
          Try Again
        </Link>
      </section>
    </main>
  );
}
