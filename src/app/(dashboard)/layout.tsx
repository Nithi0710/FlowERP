import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Role } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userRole = (session.user?.role as Role) || "ADMIN";
  const companyName = session.user?.companyName || "FlowERP";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar userRole={userRole} companyName={companyName} />
      <div className="ml-64 min-h-screen">
        <TopNav
          userName={session.user?.name}
          userEmail={session.user?.email}
          userRole={userRole}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
