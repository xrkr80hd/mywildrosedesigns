"use client";

import { useEffect, useRef, useState } from "react";

type AdminConfirmSubmitButtonProps = {
  buttonLabel: string;
  confirmMessage: string;
  idleClassName: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function AdminConfirmSubmitButton({
  buttonLabel,
  confirmMessage,
  idleClassName,
  confirmLabel = "Yes",
  cancelLabel = "No",
}: AdminConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!shellRef.current) {
        return;
      }

      if (!shellRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function confirmDelete() {
    setOpen(false);
    submitRef.current?.click();
  }

  return (
    <div ref={shellRef} className="relative inline-flex">
      <button type="button" onClick={() => setOpen(true)} className={idleClassName}>
        {buttonLabel}
      </button>

      <button ref={submitRef} type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />

      {open ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close confirmation dialog"
            className="fixed inset-0 z-[60] bg-black/25 md:hidden"
          />
          <div
            role="alertdialog"
            aria-live="assertive"
            aria-modal="true"
            className="fixed inset-x-4 top-1/2 z-[70] w-auto -translate-y-1/2 rounded-xl border border-rose/30 bg-white p-3 shadow-xl md:absolute md:right-0 md:top-[calc(100%+0.5rem)] md:z-50 md:w-80 md:translate-y-0"
          >
            <p className="text-sm font-semibold text-forest">{confirmMessage}</p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
