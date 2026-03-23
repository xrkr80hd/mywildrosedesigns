import { getSiteContentSettings } from "@/lib/site-content";
import Link from "next/link";
import { saveAboutPageContent, saveContactPageContent } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const content = await getSiteContentSettings();

  return (
    <main className="admin-content mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-surface p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Admin Content
        </p>
        <h1 className="mt-2 text-4xl text-forest">
          About + Contact Page Content
        </h1>
        <p className="mt-2 text-sm text-foreground/75">
          Edit public page text and contact details here. This is separate from
          products and inventory.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/admin"
            className="rounded-xl border border-forest/25 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
          >
            Back to Main Admin
          </Link>
          <Link
            href="/about"
            className="rounded-xl border border-forest/25 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
          >
            Open About Page
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-forest/25 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
          >
            Open Contact Page
          </Link>
        </div>
      </header>

      <section className="mt-7 rounded-2xl border border-rose/20 bg-white/85 p-5">
        <h2 className="text-2xl text-forest">About Page Content</h2>
        <form
          action={saveAboutPageContent}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Badge
            </span>
            <input
              name="aboutBadge"
              defaultValue={content.about.badge}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Title
            </span>
            <input
              name="aboutTitle"
              defaultValue={content.about.title}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Intro
            </span>
            <textarea
              name="aboutIntro"
              rows={3}
              defaultValue={content.about.intro}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Service 1 Title
            </span>
            <input
              name="serviceOneTitle"
              defaultValue={content.about.serviceOneTitle}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Service 1 Detail
            </span>
            <input
              name="serviceOneDetail"
              defaultValue={content.about.serviceOneDetail}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Service 2 Title
            </span>
            <input
              name="serviceTwoTitle"
              defaultValue={content.about.serviceTwoTitle}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Service 2 Detail
            </span>
            <input
              name="serviceTwoDetail"
              defaultValue={content.about.serviceTwoDetail}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Service 3 Title
            </span>
            <input
              name="serviceThreeTitle"
              defaultValue={content.about.serviceThreeTitle}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Service 3 Detail
            </span>
            <input
              name="serviceThreeDetail"
              defaultValue={content.about.serviceThreeDetail}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Service 4 Title
            </span>
            <input
              name="serviceFourTitle"
              defaultValue={content.about.serviceFourTitle}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Service 4 Detail
            </span>
            <input
              name="serviceFourDetail"
              defaultValue={content.about.serviceFourDetail}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              CTA Title
            </span>
            <input
              name="ctaTitle"
              defaultValue={content.about.ctaTitle}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              CTA Description
            </span>
            <input
              name="ctaDescription"
              defaultValue={content.about.ctaDescription}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Primary CTA Label
            </span>
            <input
              name="primaryCtaLabel"
              defaultValue={content.about.primaryCtaLabel}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Primary CTA Link
            </span>
            <input
              name="primaryCtaHref"
              defaultValue={content.about.primaryCtaHref}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Secondary CTA Label
            </span>
            <input
              name="secondaryCtaLabel"
              defaultValue={content.about.secondaryCtaLabel}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Secondary CTA Link
            </span>
            <input
              name="secondaryCtaHref"
              defaultValue={content.about.secondaryCtaHref}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white"
            >
              Save About Page
            </button>
          </div>
        </form>
      </section>

      <section className="mt-7 rounded-2xl border border-rose/20 bg-white/85 p-5">
        <h2 className="text-2xl text-forest">Contact Page Content</h2>
        <p className="mt-1 text-sm text-foreground/70">
          Email, phone, and address entered here also update the footer and
          printable order label.
        </p>
        <p className="mt-1 text-sm text-foreground/60">
          Leave phone blank until you are ready to publish the real number.
        </p>
        <form
          action={saveContactPageContent}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Badge
            </span>
            <input
              name="contactBadge"
              defaultValue={content.contact.badge}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Title
            </span>
            <input
              name="contactTitle"
              defaultValue={content.contact.title}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Intro
            </span>
            <textarea
              name="contactIntro"
              rows={3}
              defaultValue={content.contact.intro}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Email
            </span>
            <input
              name="contactEmail"
              defaultValue={content.contact.email}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Phone
            </span>
            <input
              name="contactPhone"
              defaultValue={content.contact.phone}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Mailing Address
            </span>
            <textarea
              name="contactAddress"
              rows={2}
              defaultValue={content.contact.address}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Printable Label Thank You Note
            </span>
            <textarea
              name="printLabelThankYouNote"
              rows={3}
              defaultValue={content.contact.printLabelThankYouNote}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Hours Title
            </span>
            <input
              name="hoursTitle"
              defaultValue={content.contact.hoursTitle}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Weekday Hours
            </span>
            <input
              name="hoursWeekday"
              defaultValue={content.contact.hoursWeekday}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Saturday Hours
            </span>
            <input
              name="hoursSaturday"
              defaultValue={content.contact.hoursSaturday}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Sunday Hours
            </span>
            <input
              name="hoursSunday"
              defaultValue={content.contact.hoursSunday}
              className="w-full rounded-xl border border-rose/20 px-3 py-2 text-sm"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white"
            >
              Save Contact Page
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
