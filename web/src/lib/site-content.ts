import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const SITE_SETTING_PREFIX = "site-setting::";
const SITE_SETTING_SORT_ORDER = 9000;

export type AboutPageContent = {
  badge: string;
  title: string;
  intro: string;
  serviceOneTitle: string;
  serviceOneDetail: string;
  serviceTwoTitle: string;
  serviceTwoDetail: string;
  serviceThreeTitle: string;
  serviceThreeDetail: string;
  serviceFourTitle: string;
  serviceFourDetail: string;
  ctaTitle: string;
  ctaDescription: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type ContactPageContent = {
  badge: string;
  title: string;
  intro: string;
  email: string;
  phone: string;
  hoursTitle: string;
  hoursWeekday: string;
  hoursSaturday: string;
  hoursSunday: string;
};

export type SiteContentSettings = {
  about: AboutPageContent;
  contact: ContactPageContent;
};

export const SITE_CONTENT_KEYS = [
  "about_badge",
  "about_title",
  "about_intro",
  "about_service_1_title",
  "about_service_1_detail",
  "about_service_2_title",
  "about_service_2_detail",
  "about_service_3_title",
  "about_service_3_detail",
  "about_service_4_title",
  "about_service_4_detail",
  "about_cta_title",
  "about_cta_description",
  "about_primary_cta_label",
  "about_primary_cta_href",
  "about_secondary_cta_label",
  "about_secondary_cta_href",
  "contact_badge",
  "contact_title",
  "contact_intro",
  "contact_email",
  "contact_phone",
  "contact_hours_title",
  "contact_hours_weekday",
  "contact_hours_saturday",
  "contact_hours_sunday",
] as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

type WelcomeSettingRow = {
  id: string;
  title: string;
  body: string;
};

const DEFAULT_VALUES_BY_KEY: Record<SiteContentKey, string> = {
  about_badge: "About Wild Rose",
  about_title: "Our Story",
  about_intro:
    "Wild Rose Design LLC builds custom apparel and gifts with a local-first approach. We focus on clean design, quality printing, and quick communication from quote to delivery.",
  about_service_1_title: "Custom Design",
  about_service_1_detail:
    "We can print your existing art or help refine concept mockups.",
  about_service_2_title: "Apparel & Spirit Wear",
  about_service_2_detail:
    "School, team, and organization merch with consistent quality.",
  about_service_3_title: "Seasonal Collections",
  about_service_3_detail:
    "Holiday and seasonal drops with fast turnarounds for events.",
  about_service_4_title: "Bulk Orders",
  about_service_4_detail:
    "Quantity pricing options for clubs, booster groups, and businesses.",
  about_cta_title: "Ready to get started?",
  about_cta_description:
    "Upload your design now or contact us for a quote on large orders.",
  about_primary_cta_label: "Upload Design",
  about_primary_cta_href: "/upload",
  about_secondary_cta_label: "Contact Us",
  about_secondary_cta_href: "/contact",
  contact_badge: "Contact",
  contact_title: "Get in Touch",
  contact_intro:
    "Need a quote, turnaround timing, or help with a custom order? Send a message.",
  contact_email: "orders@wildrosedesign.com",
  contact_phone: "(555) 123-WILD",
  contact_hours_title: "Business Hours",
  contact_hours_weekday: "Mon - Fri: 9:00 AM - 6:00 PM",
  contact_hours_saturday: "Saturday: 10:00 AM - 4:00 PM",
  contact_hours_sunday: "Sunday: Closed",
};

const DEFAULT_SITE_CONTENT: SiteContentSettings = {
  about: {
    badge: DEFAULT_VALUES_BY_KEY.about_badge,
    title: DEFAULT_VALUES_BY_KEY.about_title,
    intro: DEFAULT_VALUES_BY_KEY.about_intro,
    serviceOneTitle: DEFAULT_VALUES_BY_KEY.about_service_1_title,
    serviceOneDetail: DEFAULT_VALUES_BY_KEY.about_service_1_detail,
    serviceTwoTitle: DEFAULT_VALUES_BY_KEY.about_service_2_title,
    serviceTwoDetail: DEFAULT_VALUES_BY_KEY.about_service_2_detail,
    serviceThreeTitle: DEFAULT_VALUES_BY_KEY.about_service_3_title,
    serviceThreeDetail: DEFAULT_VALUES_BY_KEY.about_service_3_detail,
    serviceFourTitle: DEFAULT_VALUES_BY_KEY.about_service_4_title,
    serviceFourDetail: DEFAULT_VALUES_BY_KEY.about_service_4_detail,
    ctaTitle: DEFAULT_VALUES_BY_KEY.about_cta_title,
    ctaDescription: DEFAULT_VALUES_BY_KEY.about_cta_description,
    primaryCtaLabel: DEFAULT_VALUES_BY_KEY.about_primary_cta_label,
    primaryCtaHref: DEFAULT_VALUES_BY_KEY.about_primary_cta_href,
    secondaryCtaLabel: DEFAULT_VALUES_BY_KEY.about_secondary_cta_label,
    secondaryCtaHref: DEFAULT_VALUES_BY_KEY.about_secondary_cta_href,
  },
  contact: {
    badge: DEFAULT_VALUES_BY_KEY.contact_badge,
    title: DEFAULT_VALUES_BY_KEY.contact_title,
    intro: DEFAULT_VALUES_BY_KEY.contact_intro,
    email: DEFAULT_VALUES_BY_KEY.contact_email,
    phone: DEFAULT_VALUES_BY_KEY.contact_phone,
    hoursTitle: DEFAULT_VALUES_BY_KEY.contact_hours_title,
    hoursWeekday: DEFAULT_VALUES_BY_KEY.contact_hours_weekday,
    hoursSaturday: DEFAULT_VALUES_BY_KEY.contact_hours_saturday,
    hoursSunday: DEFAULT_VALUES_BY_KEY.contact_hours_sunday,
  },
};

function toSettingTitle(key: SiteContentKey): string {
  return `${SITE_SETTING_PREFIX}${key}`;
}

function toSettingKey(title: string): SiteContentKey | null {
  if (!title.startsWith(SITE_SETTING_PREFIX)) {
    return null;
  }

  const key = title.slice(SITE_SETTING_PREFIX.length);
  if (SITE_CONTENT_KEYS.includes(key as SiteContentKey)) {
    return key as SiteContentKey;
  }

  return null;
}

function readValue(
  map: Map<SiteContentKey, string>,
  key: SiteContentKey,
): string {
  const candidate = map.get(key)?.trim() ?? "";
  return candidate || DEFAULT_VALUES_BY_KEY[key];
}

export function isSiteSettingTitle(title: string): boolean {
  return title.startsWith(SITE_SETTING_PREFIX);
}

export async function getSiteContentSettings(): Promise<SiteContentSettings> {
  try {
    noStore();
  } catch {
    // noStore is only available in request contexts; scripts can safely skip it.
  }

  try {
    const supabase = getSupabaseAdminClient();
    const result = await supabase
      .from("welcome_posts")
      .select("title, body")
      .like("title", `${SITE_SETTING_PREFIX}%`)
      .eq("active", false)
      .limit(100);

    if (result.error) {
      return DEFAULT_SITE_CONTENT;
    }

    const valuesByKey = new Map<SiteContentKey, string>();
    for (const row of (result.data ?? []) as Array<{ title: string; body: string }>) {
      const key = toSettingKey(row.title);
      if (!key) {
        continue;
      }
      valuesByKey.set(key, String(row.body ?? "").trim());
    }

    return {
      about: {
        badge: readValue(valuesByKey, "about_badge"),
        title: readValue(valuesByKey, "about_title"),
        intro: readValue(valuesByKey, "about_intro"),
        serviceOneTitle: readValue(valuesByKey, "about_service_1_title"),
        serviceOneDetail: readValue(valuesByKey, "about_service_1_detail"),
        serviceTwoTitle: readValue(valuesByKey, "about_service_2_title"),
        serviceTwoDetail: readValue(valuesByKey, "about_service_2_detail"),
        serviceThreeTitle: readValue(valuesByKey, "about_service_3_title"),
        serviceThreeDetail: readValue(valuesByKey, "about_service_3_detail"),
        serviceFourTitle: readValue(valuesByKey, "about_service_4_title"),
        serviceFourDetail: readValue(valuesByKey, "about_service_4_detail"),
        ctaTitle: readValue(valuesByKey, "about_cta_title"),
        ctaDescription: readValue(valuesByKey, "about_cta_description"),
        primaryCtaLabel: readValue(valuesByKey, "about_primary_cta_label"),
        primaryCtaHref: readValue(valuesByKey, "about_primary_cta_href"),
        secondaryCtaLabel: readValue(valuesByKey, "about_secondary_cta_label"),
        secondaryCtaHref: readValue(valuesByKey, "about_secondary_cta_href"),
      },
      contact: {
        badge: readValue(valuesByKey, "contact_badge"),
        title: readValue(valuesByKey, "contact_title"),
        intro: readValue(valuesByKey, "contact_intro"),
        email: readValue(valuesByKey, "contact_email"),
        phone: readValue(valuesByKey, "contact_phone"),
        hoursTitle: readValue(valuesByKey, "contact_hours_title"),
        hoursWeekday: readValue(valuesByKey, "contact_hours_weekday"),
        hoursSaturday: readValue(valuesByKey, "contact_hours_saturday"),
        hoursSunday: readValue(valuesByKey, "contact_hours_sunday"),
      },
    };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function saveSiteContentValues(
  values: Partial<Record<SiteContentKey, string>>,
): Promise<void> {
  const entries = Object.entries(values)
    .filter(([key]) => SITE_CONTENT_KEYS.includes(key as SiteContentKey))
    .map(([key, value]) => [key as SiteContentKey, String(value ?? "").trim()] as const);

  if (entries.length === 0) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const titles = entries.map(([key]) => toSettingTitle(key));

  const existingResult = await supabase
    .from("welcome_posts")
    .select("id, title")
    .in("title", titles)
    .eq("active", false);

  if (existingResult.error) {
    throw new Error(existingResult.error.message);
  }

  const existingByTitle = new Map(
    ((existingResult.data ?? []) as Array<Pick<WelcomeSettingRow, "id" | "title">>).map(
      (row) => [row.title, row.id],
    ),
  );

  for (const [key, value] of entries) {
    const title = toSettingTitle(key);
    const payload = {
      title,
      body: value || DEFAULT_VALUES_BY_KEY[key],
      cta_label: null,
      cta_href: null,
      sort_order: SITE_SETTING_SORT_ORDER,
      active: false,
    };

    const existingId = existingByTitle.get(title);
    const writeResult = existingId
      ? await supabase.from("welcome_posts").update(payload).eq("id", existingId)
      : await supabase.from("welcome_posts").insert(payload);

    if (writeResult.error) {
      throw new Error(writeResult.error.message);
    }
  }
}
