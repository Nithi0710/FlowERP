"use client";

import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { useSession } from "next-auth/react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar userRole={userRole} />
      <div className="ml-64">
        <TopNav />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
