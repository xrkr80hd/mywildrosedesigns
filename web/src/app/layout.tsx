import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const headingFont = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteDescription =
  "Custom apparel, school spirit wear, seasonal collections, and custom design uploads.";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.mywildrosedesigns.com";
const metadataBase = new URL(siteUrl);
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Wild Rose Designs, LLC",
  url: siteUrl,
  logo: `${siteUrl}/assets/img/MyWRDLogo.png`,
  description: siteDescription,
};

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Wild Rose Designs",
    template: "%s | Wild Rose Designs",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName: "Wild Rose Designs",
    title: "Wild Rose Designs",
    description: siteDescription,
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wild Rose Designs logo on white background",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wild Rose Designs",
    description: siteDescription,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
