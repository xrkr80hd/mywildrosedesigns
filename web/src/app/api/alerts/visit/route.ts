import { sendAlert } from "@/lib/alerts";
import { NextResponse } from "next/server";

const THROTTLE_COOKIE_NAME = "visit_alert_last_sent";
const DEFAULT_THROTTLE_MINUTES = 120;
const TRACKED_PATHS = new Set(["/", "/shop", "/upload", "/contact"]);

function isVisitAlertsEnabled(): boolean {
  return (process.env.PAGE_VISIT_ALERTS_ENABLED ?? "").trim().toLowerCase() === "true";
}

function getThrottleMinutes(): number {
  const configured = Number(process.env.PAGE_VISIT_ALERT_THROTTLE_MINUTES ?? "");
  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_THROTTLE_MINUTES;
  }

  return Math.floor(configured);
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const first = forwarded.split(",")[0]?.trim();
  return first || "unknown";
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) {
    return null;
  }

  const pairs = header.split(";");
  for (const pair of pairs) {
    const trimmed = pair.trim();
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (key !== name) {
      continue;
    }

    return decodeURIComponent(trimmed.slice(separatorIndex + 1).trim());
  }

  return null;
}

export async function POST(request: Request) {
  if (!isVisitAlertsEnabled()) {
    return NextResponse.json({ ok: true, skipped: "disabled" });
  }

  const throttleMinutes = getThrottleMinutes();
  const lastSentRaw = readCookie(request, THROTTLE_COOKIE_NAME);
  const lastSentAt = lastSentRaw ? Number(lastSentRaw) : 0;
  const now = Date.now();
  if (lastSentAt > 0 && now - lastSentAt < throttleMinutes * 60 * 1000) {
    return NextResponse.json({ ok: true, skipped: "throttled" });
  }

  let path = "/";
  try {
    const body = (await request.json().catch(() => ({}))) as { path?: unknown };
    if (typeof body.path === "string" && body.path.startsWith("/")) {
      path = body.path;
    }
  } catch {
    // Ignore payload parsing failures and keep default path.
  }

  if (!TRACKED_PATHS.has(path)) {
    return NextResponse.json({ ok: true, skipped: "untracked_path" });
  }

  const result = await sendAlert({
    eventType: "page_visit",
    message: `Visited ${path}`,
    path,
    metadata: {
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") ?? "unknown",
      referrer: request.headers.get("referer") ?? null,
    },
  });

  const response = NextResponse.json({ ok: true, sent: result.sent });
  response.cookies.set(THROTTLE_COOKIE_NAME, String(now), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: throttleMinutes * 60,
  });
  return response;
}
