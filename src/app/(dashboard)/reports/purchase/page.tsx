import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

export default async function PurchaseReportsPage() {
  const orders = await prisma.purchaseOrder.findMany({
    include: { vendor: true },
    orderBy: { createdAt: "desc" },
  });

  const totalSpend = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Purchase Reports</h1>
        <p className="text-sm text-gray-500">Procurement spend and vendor order summary</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total POs</p><p className="text-2xl font-bold">{orders.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total Spend</p><p className="text-2xl font-bold">{formatCurrency(totalSpend)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Received</p><p className="text-2xl font-bold">{orders.filter((o) => o.status === "RECEIVED").length}</p></CardContent></Card>
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={orders as unknown as Record<string, unknown>[]} columns={[
          { key: "orderNumber", header: "PO #" },
          { key: "vendor", header: "Vendor", render: (i) => String((i.vendor as { name?: string })?.name ?? "-") },
          { key: "orderDate", header: "Date", render: (i) => formatDate(String(i.orderDate)) },
          { key: "totalAmount", header: "Amount", render: (i) => formatCurrency(Number(i.totalAmount)) },
          { key: "status", header: "Status", render: (i) => <StatusBadge status={String(i.status)} /> },
        ]} />
      </CardContent></Card>
    </div>
  );
}
