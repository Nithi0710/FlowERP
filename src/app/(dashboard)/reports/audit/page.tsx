import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatDateTime } from "@/lib/utils";

export default async function AuditReportsPage() {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Reports</h1>
        <p className="text-sm text-gray-500">Complete audit trail of all system actions</p>
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={logs as unknown as Record<string, unknown>[]} columns={[
          { key: "createdAt", header: "Timestamp", render: (i) => formatDateTime(String(i.createdAt)) },
          { key: "user", header: "User", render: (i) => String((i.user as {name?:string})?.name || "System") },
          { key: "action", header: "Action" },
          { key: "module", header: "Module" },
          { key: "entityId", header: "Entity" },
          { key: "newValue", header: "New Value" },
        ]} />
      </CardContent></Card>
    </div>
  );
}
