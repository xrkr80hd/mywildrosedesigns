"use client";

import { useMemo, useState } from "react";

type PrintOrderLabelButtonProps = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productOption: string;
  quantity: number;
  createdAt: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  defaultThankYouNote: string;
};

const BUSINESS_NAME = "Wild Rose Designs";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function PrintOrderLabelButton({
  orderNumber,
  customerName,
  customerEmail,
  productOption,
  quantity,
  createdAt,
  businessAddress,
  businessEmail,
  businessPhone,
  defaultThankYouNote,
}: PrintOrderLabelButtonProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [recipientName, setRecipientName] = useState(
    customerName || "Customer",
  );
  const [recipientEmail, setRecipientEmail] = useState(customerEmail || "");
  const [labelNote, setLabelNote] = useState("");
  const [thankYouNote, setThankYouNote] = useState(defaultThankYouNote);

  const createdAtText = useMemo(() => formatDateTime(createdAt), [createdAt]);

  function printLabel() {
    if (typeof window === "undefined") {
      return;
    }

    const logoUrl = `${window.location.origin}/assets/img/MyWRDLogo.png`;
    const printWindow = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=980,height=760",
    );
    if (!printWindow) {
      window.alert(
        "Unable to open print window. Please allow popups and try again.",
      );
      return;
    }

    const safeRecipient = escapeHtml(recipientName || "Customer");
    const safeRecipientEmail = escapeHtml(recipientEmail || "-");
    const safeOption = escapeHtml(productOption || "Custom order");
    const safeOrderNumber = escapeHtml(orderNumber);
    const safeCreated = escapeHtml(createdAtText);
    const safeLabelNote = escapeHtml(labelNote || "-");
    const safeThankYou = escapeHtml(thankYouNote || defaultThankYouNote);
    const safeBusinessLine = escapeHtml(
      [BUSINESS_NAME, businessAddress.replace(/\s+/g, " ").trim()]
        .filter(Boolean)
        .join(" | "),
    );
    const safeBusinessContact = escapeHtml(
      [businessEmail.trim(), businessPhone.trim()].filter(Boolean).join(" | "),
    );

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Order Label ${safeOrderNumber}</title>
    <style>
      body {
        margin: 0;
        padding: 16px;
        font-family: Arial, sans-serif;
        color: #1f2937;
        background: #fff;
      }
      .label {
        width: 100%;
        max-width: 680px;
        margin: 0 auto;
        border: 2px solid #2f4b3c;
        border-radius: 8px;
        padding: 16px;
      }
      .logo {
        width: 300px;
        max-width: 100%;
        display: block;
        margin: 0 auto 16px;
      }
      .sub {
        margin: 0;
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
      }
      .grid {
        margin-top: 18px;
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 8px 10px;
        font-size: 13px;
      }
      .label-key {
        font-weight: 700;
      }
      .section {
        margin-top: 14px;
        border-top: 1px dashed #d1d5db;
        padding-top: 12px;
      }
      .thank {
        margin-top: 6px;
        font-size: 12px;
        line-height: 1.45;
      }
      .footer {
        margin-top: 14px;
        font-size: 12px;
        text-align: center;
        color: #374151;
      }
      @media print {
        body {
          padding: 0;
        }
        .label {
          border-width: 1.5px;
          border-radius: 0;
          max-width: none;
        }
      }
    </style>
  </head>
  <body>
    <div class="label">
      <img src="${logoUrl}" alt="Wild Rose Designs" class="logo" />
      <p class="sub">${safeBusinessLine}</p>

      <div class="grid">
        <div class="label-key">Order #</div><div>${safeOrderNumber}</div>
        <div class="label-key">Customer</div><div>${safeRecipient}</div>
        <div class="label-key">Customer Email</div><div>${safeRecipientEmail}</div>
        <div class="label-key">Item</div><div>${safeOption}</div>
        <div class="label-key">Quantity</div><div>${quantity}</div>
        <div class="label-key">Placed</div><div>${safeCreated}</div>
        <div class="label-key">Fulfillment Note</div><div>${safeLabelNote}</div>
      </div>

      <div class="section">
        <div class="label-key">Thank You Note</div>
        <p class="thank">${safeThankYou}</p>
      </div>

      <div class="footer">
        ${safeBusinessContact}
      </div>
    </div>

    <script>
      window.addEventListener("load", function () {
        setTimeout(function () {
          window.print();
        }, 180);
      });
    </script>
  </body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
        <button
          type="button"
          onClick={printLabel}
          className="w-full rounded-md border border-forest/30 bg-white px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-white sm:w-auto"
        >
          Print Item Label
        </button>
        <button
          type="button"
          onClick={() => setShowEditor((previous) => !previous)}
          className="w-full rounded-md border border-rose/35 bg-white px-3 py-2 text-xs font-semibold text-rose hover:bg-rose/10 sm:w-auto"
        >
          Edit Label?
        </button>
      </div>
      {showEditor ? (
        <div className="grid gap-2 rounded-xl border border-rose/20 bg-white p-3 text-left md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
              Recipient Name
            </span>
            <input
              value={recipientName}
              onChange={(event) => setRecipientName(event.currentTarget.value)}
              className="w-full rounded-lg border border-rose/20 px-3 py-2 text-xs"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
              Recipient Email
            </span>
            <input
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.currentTarget.value)}
              className="w-full rounded-lg border border-rose/20 px-3 py-2 text-xs"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
              Fulfillment Note
            </span>
            <input
              value={labelNote}
              onChange={(event) => setLabelNote(event.currentTarget.value)}
              placeholder="Left at drop-off 1 at 3:30 PM"
              className="w-full rounded-lg border border-rose/20 px-3 py-2 text-xs"
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
              Thank You Message
            </span>
            <textarea
              value={thankYouNote}
              onChange={(event) => setThankYouNote(event.currentTarget.value)}
              rows={3}
              className="w-full rounded-lg border border-rose/20 px-3 py-2 text-xs"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
