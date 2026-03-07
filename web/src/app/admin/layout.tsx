import { Suspense } from "react";
import { AdminActionToast } from "@/components/admin-action-toast";

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
      <div className="admin-shell-banner">
        <strong>Admin Editing Mode</strong>
        <span>Changes made here update storefront content.</span>
      </div>
      {children}
    </div>
  );
}
