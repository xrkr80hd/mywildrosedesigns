"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

type AdminAttentionAlertsProps = {
  newMessageCount: number;
  newOrderCount: number;
  latestMessageId: string | null;
  latestOrderId: string | null;
};

const MESSAGE_SEEN_KEY = "wr_admin_last_seen_message_id";
const ORDER_SEEN_KEY = "wr_admin_last_seen_order_id";
const INTERNAL_STORAGE_EVENT = "wr_admin_attention_storage_update";

type AttentionSnapshot = {
  seenMessageId: string | null;
  seenOrderId: string | null;
};

const EMPTY_SNAPSHOT: AttentionSnapshot = {
  seenMessageId: null,
  seenOrderId: null,
};

let cachedSnapshot: AttentionSnapshot = EMPTY_SNAPSHOT;

function safeGetStorageItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore write failures (private mode / blocked storage) and keep UI usable.
  }
}

function readAttentionSnapshot(): AttentionSnapshot {
  if (typeof window === "undefined") {
    return EMPTY_SNAPSHOT;
  }

  const seenMessageId = safeGetStorageItem(MESSAGE_SEEN_KEY);
  const seenOrderId = safeGetStorageItem(ORDER_SEEN_KEY);

  if (
    cachedSnapshot.seenMessageId === seenMessageId &&
    cachedSnapshot.seenOrderId === seenOrderId
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = {
    seenMessageId,
    seenOrderId,
  };

  return cachedSnapshot;
}

function subscribeToAttentionSnapshot(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorageEvent = (event: StorageEvent) => {
    if (!event.key || event.key === MESSAGE_SEEN_KEY || event.key === ORDER_SEEN_KEY) {
      onStoreChange();
    }
  };
  const handleInternalEvent = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorageEvent);
  window.addEventListener(INTERNAL_STORAGE_EVENT, handleInternalEvent);

  return () => {
    window.removeEventListener("storage", handleStorageEvent);
    window.removeEventListener(INTERNAL_STORAGE_EVENT, handleInternalEvent);
  };
}

function notifyAttentionSnapshotChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(INTERNAL_STORAGE_EVENT));
  }
}

export function AdminAttentionAlerts({
  newMessageCount,
  newOrderCount,
  latestMessageId,
  latestOrderId,
}: AdminAttentionAlertsProps) {
  const { seenMessageId, seenOrderId } = useSyncExternalStore(
    subscribeToAttentionSnapshot,
    readAttentionSnapshot,
    () => EMPTY_SNAPSHOT,
  );

  const showMessageAlert = Boolean(latestMessageId) && newMessageCount > 0 && seenMessageId !== latestMessageId;
  const showOrderAlert = Boolean(latestOrderId) && newOrderCount > 0 && seenOrderId !== latestOrderId;

  if (!showMessageAlert && !showOrderAlert) {
    return null;
  }

  function markMessagesRead() {
    if (!latestMessageId) {
      return;
    }
    safeSetStorageItem(MESSAGE_SEEN_KEY, latestMessageId);
    notifyAttentionSnapshotChanged();
  }

  function markOrdersRead() {
    if (!latestOrderId) {
      return;
    }
    safeSetStorageItem(ORDER_SEEN_KEY, latestOrderId);
    notifyAttentionSnapshotChanged();
  }

  return (
    <section className="mt-4 space-y-3">
      {showMessageAlert ? (
        <div className="rounded-2xl border border-rose/30 bg-white/92 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                Attention Needed
              </p>
              <p className="mt-1 text-sm font-semibold text-forest">
                You have {newMessageCount} new customer message{newMessageCount === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="#customer-messages"
                className="rounded-lg border border-forest/20 bg-white px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
              >
                Review Messages
              </Link>
              <button
                type="button"
                onClick={markMessagesRead}
                className="rounded-lg border border-rose/30 px-3 py-2 text-xs font-semibold text-rose hover:bg-rose hover:text-white"
              >
                Mark Read
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showOrderAlert ? (
        <div className="rounded-2xl border border-forest/25 bg-surface/90 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                Order Queue
              </p>
              <p className="mt-1 text-sm font-semibold text-forest">
                You have {newOrderCount} order{newOrderCount === 1 ? "" : "s"} waiting in Orders and Uploads.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="#orders-uploads"
                className="rounded-lg border border-forest/20 bg-white px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
              >
                Review Orders
              </Link>
              <button
                type="button"
                onClick={markOrdersRead}
                className="rounded-lg border border-forest/25 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white"
              >
                Mark Read
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
