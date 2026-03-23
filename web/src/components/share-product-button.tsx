"use client";

import { useState } from "react";

type ShareProductButtonProps = {
  path: string;
  title: string;
  label?: string;
  className?: string;
  showStatusText?: boolean;
};

function resolveShareUrl(path: string) {
  if (typeof window === "undefined") {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${window.location.origin}${path}`;
  }

  return `${window.location.origin}/${path}`;
}

export function ShareProductButton({
  path,
  title,
  label = "Share",
  className = "",
  showStatusText = true,
}: ShareProductButtonProps) {
  const [status, setStatus] = useState("");

  async function handleShare() {
    const url = resolveShareUrl(path);
    let copied = false;

    try {
      await navigator.clipboard.writeText(url);
      copied = true;
    } catch {
      copied = false;
    }

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: title,
          url,
        });
        setStatus(copied ? "Copied + share opened" : "Share opened");
        window.setTimeout(() => setStatus(""), 2200);
        return;
      } catch (error) {
        const aborted = error instanceof Error && error.name === "AbortError";
        if (aborted) {
          setStatus(copied ? "Copied" : "");
          window.setTimeout(() => setStatus(""), 1800);
          return;
        }
      }
    }

    setStatus(copied ? "Copied" : "Unable to share");
    window.setTimeout(() => setStatus(""), 2200);
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className={
          className ||
          "rounded-xl border border-forest/20 bg-white px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
        }
      >
        {label}
      </button>
      {showStatusText && status ? <span className="text-[11px] text-foreground/70">{status}</span> : null}
    </div>
  );
}
