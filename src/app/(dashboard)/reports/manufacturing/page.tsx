import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

export default async function ManufacturingReportsPage() {
  const orders = await prisma.manufacturingOrder.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manufacturing Reports</h1>
        <p className="text-sm text-gray-500">Production orders and completion status</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {(["DRAFT", "CONFIRMED", "IN_PROGRESS", "DONE"] as const).map((s) => (
          <Card key={s}><CardContent className="pt-6"><p className="text-sm text-gray-500">{s.replace("_", " ")}</p><p className="text-2xl font-bold">{orders.filter((o) => o.status === s).length}</p></CardContent></Card>
        ))}
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={orders as unknown as Record<string, unknown>[]} columns={[
          { key: "orderNumber", header: "MO #" },
          { key: "product", header: "Product", render: (i) => String((i.product as { name?: string })?.name ?? "-") },
          { key: "quantity", header: "Qty" },
          { key: "plannedStart", header: "Planned Start", render: (i) => i.plannedStart ? formatDate(String(i.plannedStart)) : "—" },
          { key: "status", header: "Status", render: (i) => <StatusBadge status={String(i.status)} /> },
        ]} />
      </CardContent></Card>
    </div>
  );
}
