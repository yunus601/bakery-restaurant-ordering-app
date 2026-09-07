import type { Metadata } from "next";

import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") || "Administrator";

  return (
    <div className="min-h-screen bg-[#faf7f4] text-foreground">
      <AdminNavigation adminName={adminName} adminEmail={admin.email} />
      <main className="lg:pl-72">{children}</main>
    </div>
  );
}
