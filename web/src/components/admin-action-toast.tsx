"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TOAST_MESSAGES: Record<string, string> = {
  homepage_saved: "Homepage settings saved.",
  about_saved: "About page content saved.",
  contact_saved: "Contact page content saved.",
  popup_saved: "Promo popup saved.",
  welcome_created: "Feature card created.",
  welcome_updated: "Feature card updated.",
  welcome_deleted: "Feature card deleted.",
  category_created: "Category created.",
  category_updated: "Category updated.",
  category_deleted: "Category deleted. Existing products were moved to Uncategorized.",
  category_has_products: "Move or delete products in this category before deleting it.",
  product_created: "Product created.",
  product_updated: "Product updated.",
  product_deleted: "Product deleted.",
  variant_created: "Variant created.",
  variant_updated: "Variant updated.",
  variant_deleted: "Variant deleted.",
  variant_conflict: "That size/color variant already exists for this product.",
  variant_requires_option: "Each variant needs at least a size or color value.",
  variant_table_missing: "Variants table is missing. Run the latest Supabase migration first.",
  transfer_pricing_saved: "Upload transfer pricing updated.",
  message_updated: "Message status updated.",
  order_updated: "Order status updated.",
  order_archived: "Order archived.",
  order_unarchived: "Order moved back to active.",
  orders_archived: "Completed/cancelled orders archived.",
  archived_orders_cleared: "Archived orders cleared.",
  order_archive_not_eligible: "Only completed or cancelled orders can be archived.",
  order_archive_schema_missing: "Order archive fields are missing. Run the latest Supabase migration.",
  invalid_payload: "Please review the form fields and try again.",
  save_failed: "Unable to save changes right now.",
  unexpected_error: "An unexpected error occurred.",
};

function resolveToastMessage(code: string | null) {
  if (!code) {
    return null;
  }

  return TOAST_MESSAGES[code] ?? code;
}

export function AdminActionToast() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successCode = searchParams.get("toast");
  const errorCode = searchParams.get("error");
  const variant = errorCode ? "error" : successCode ? "success" : null;
  const message = useMemo(
    () => resolveToastMessage(errorCode ?? successCode),
    [errorCode, successCode],
  );

  useEffect(() => {
    if (!message || !variant) {
      return;
    }

    const clearTimer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("toast");
      nextParams.delete("error");
      const nextQuery = nextParams.toString();
      const hash = window.location.hash ?? "";
      router.replace(nextQuery ? `${pathname}?${nextQuery}${hash}` : `${pathname}${hash}`, { scroll: false });
    }, 3000);

    return () => {
      window.clearTimeout(clearTimer);
    };
  }, [message, pathname, router, searchParams, variant]);

  if (!message || !variant) {
    return null;
  }

  return (
    <div className="admin-toast-wrap" role="status" aria-live="polite">
      <div
        className={`admin-toast ${
          variant === "error" ? "admin-toast-error" : "admin-toast-success"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
