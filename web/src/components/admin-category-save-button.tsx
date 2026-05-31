"use client";

import { useRef, useState } from "react";

type AdminCategorySaveButtonProps = {
  categoryName: string;
  initiallyActive: boolean;
  itemCount: number;
};

export function AdminCategorySaveButton({
  categoryName,
  initiallyActive,
  itemCount,
}: AdminCategorySaveButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  function shouldConfirmDeactivation() {
    const form = shellRef.current?.closest("form");
    if (!form || !initiallyActive || itemCount === 0) {
      return false;
    }

    const formData = new FormData(form);
    return !formData.has("active");
  }

  function requestSubmit() {
    if (shouldConfirmDeactivation()) {
      setConfirmOpen(true);
      return;
    }

    submitRef.current?.click();
  }

  function confirmSubmit() {
    setConfirmOpen(false);
    submitRef.current?.click();
  }

  const itemLabel = itemCount === 1 ? "item" : "items";

  return (
    <div ref={shellRef} className="relative inline-flex">
      <button
        type="button"
        onClick={requestSubmit}
        className="rounded-xl bg-rose px-4 py-2 text-sm font-semibold text-white"
      >
        Save Category
      </button>
      <button
        ref={submitRef}
        type="submit"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      {confirmOpen ? (
        <>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            aria-label="Close confirmation dialog"
            className="fixed inset-0 z-[60] bg-black/25 md:hidden"
          />
          <div
            role="alertdialog"
            aria-live="assertive"
            aria-modal="true"
            className="fixed inset-x-4 top-1/2 z-[70] w-auto -translate-y-1/2 rounded-xl border border-rose/30 bg-white p-3 shadow-xl md:absolute md:right-0 md:top-[calc(100%+0.5rem)] md:z-50 md:w-96 md:translate-y-0"
          >
            <p className="text-sm font-semibold text-forest">
              Are you sure you want to deactivate category {categoryName}? There
              are {itemCount} {itemLabel} in this category. They will be moved
              to Uncategorized.
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
