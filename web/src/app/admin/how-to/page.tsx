import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin How-To",
};

const steps = [
  "Log in at /admin/login using the admin username/password from environment variables.",
  "Use /admin/content to edit About and Contact page copy, contact email, phone, and business hours (separate from inventory).",
  "In Homepage Hero, edit the badge, headline, paragraph text, and CTA buttons shown on the top of Home.",
  "In Homepage Feature Cards, add, edit, reorder, or delete the cards shown on Home under Homepage Highlights.",
  "In Categories, add new categories or update existing ones for the Shop filters.",
  "In Add New Product Card and Product Cards, create products and edit pricing, stock, sale flags, and button text.",
  "In Promotional Popup, control the popup modal separately, including the editable popup label text (this is different from featured products and homepage cards).",
  "In Customer Messages, track contact requests and set status to new, in progress, or resolved.",
  "In Orders and Uploads, download customer design files and update order production status.",
  "After saving changes, refresh the public page (Home, Shop, Upload, Contact) to confirm updates.",
];

const imageGuidelines = [
  "Product card image: 1200 x 1200 px (square), PNG or WEBP preferred.",
  "Homepage large logo block: 1600 x 1600 px transparent PNG for best quality.",
  "Header logo (small round icon): 512 x 512 px square image.",
  "Popup product image: same source as product image, so use the 1200 x 1200 square format.",
  "General upload assets: keep under 5MB per display image for faster load times.",
];

export default function AdminHowToPage() {
  return (
    <main className="admin-content mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <header className="rounded-3xl border border-rose/20 bg-white/85 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Admin How-To
        </p>
        <h1 className="mt-2 text-4xl text-forest">Handoff Guide</h1>
        <p className="mt-2 text-sm text-foreground/75">
          How to edit the website pages and sections from the admin dashboard.
        </p>
      </header>
      <section className="mt-6 rounded-2xl border border-rose/20 bg-white/90 p-6">
        <ol className="space-y-3 text-sm text-foreground/80">
          {steps.map((step, index) => (
            <li key={step}>
              <span className="mr-2 font-semibold text-rose">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-2xl border border-rose/20 bg-white/90 p-6">
        <h2 className="text-2xl text-forest">Image Size Guide</h2>
        <ul className="mt-4 space-y-3 text-sm text-foreground/80">
          {imageGuidelines.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
