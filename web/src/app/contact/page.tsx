import { ContactFormClient } from "@/components/contact-form-client";
import { getSiteContentSettings } from "@/lib/site-content";

export default async function ContactPage() {
  const content = await getSiteContentSettings();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-white/85 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          {content.contact.badge}
        </p>
        <h1 className="mt-2 text-4xl text-forest">{content.contact.title}</h1>
        <p className="mt-2 text-sm text-foreground/75">
          {content.contact.intro}
        </p>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <ContactFormClient />

        <aside className="rounded-3xl border border-rose/20 bg-surface p-6">
          <h2 className="text-2xl text-forest">Contact Details</h2>
          <p className="mt-3 text-sm text-foreground/75">
            <a
              href={`mailto:${content.contact.email}`}
              className="hover:text-rose"
            >
              {content.contact.email}
            </a>
          </p>
          {content.contact.phone ? (
            <p className="mt-1 text-sm text-foreground/75">
              {content.contact.phone}
            </p>
          ) : null}
          <p className="mt-3 whitespace-pre-line text-sm text-foreground/75">
            {content.contact.address}
          </p>
          <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-foreground/75">
            <p className="font-semibold text-forest">
              {content.contact.hoursTitle}
            </p>
            <p className="mt-2">{content.contact.hoursWeekday}</p>
            <p>{content.contact.hoursSaturday}</p>
            <p>{content.contact.hoursSunday}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
