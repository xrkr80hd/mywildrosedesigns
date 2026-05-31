import { AdminActionToast } from "@/components/admin-action-toast";
import { AdminHelpShell } from "@/components/admin-help-shell";
import { AdminUiState } from "@/components/admin-ui-state";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-shell">
      <Suspense fallback={null}>
        <AdminActionToast />
      </Suspense>
      <AdminUiState />
      <AdminHelpShell />
      <div className="admin-shell-banner">
        <strong>Admin Editing Mode</strong>
        <span>Changes made here update storefront content.</span>
      </div>
      {children}
    </div>
  );
}
