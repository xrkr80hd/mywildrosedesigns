"use client";
import { useState } from "react";
import type { PopupTiming } from "@/lib/popup-timing-options";
import { updatePopupTiming } from "./actions";
export function PopupTimingControls({ initial }: { initial: PopupTiming }) {
  const [delay, setDelay] = useState(initial.delaySeconds);
  const [fade, setFade] = useState(initial.fadeSeconds);
  return <details className="mt-6 border border-rose/30 bg-white p-4"><summary className="cursor-pointer text-xl font-semibold">Promotion Popup Timing</summary>
    <p className="mt-3 text-sm">The popup waits after the page loads, fades in gently, then stays visible for 10 seconds. Hovering or focusing keeps it open.</p>
    <form action={updatePopupTiming} className="mt-4 grid gap-5">
      <label className="grid gap-2">Wait before appearing: <strong>{delay.toFixed(1)} seconds</strong><input type="range" name="delaySeconds" min="2" max="20" step=".5" value={delay} onChange={event => setDelay(Number(event.target.value))} /></label>
      <label className="grid gap-2">Fade in and out: <strong>{fade.toFixed(1)} seconds</strong><input type="range" name="fadeSeconds" min=".8" max="5" step=".1" value={fade} onChange={event => setFade(Number(event.target.value))} /></label>
      <button className="border border-forest bg-forest px-4 py-2 text-white">Save Popup Timing</button>
    </form>
  </details>;
}
