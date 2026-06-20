import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

export default async function SalesReportsPage() {
  const orders = await prisma.salesOrder.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Reports</h1>
        <p className="text-sm text-gray-500">Revenue and order performance summary</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total Orders</p><p className="text-2xl font-bold">{orders.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total Revenue</p><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Confirmed</p><p className="text-2xl font-bold">{orders.filter((o) => o.status === "CONFIRMED").length}</p></CardContent></Card>
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={orders as unknown as Record<string, unknown>[]} columns={[
          { key: "orderNumber", header: "Order #" },
          { key: "customer", header: "Customer", render: (i) => String((i.customer as { name?: string })?.name ?? "-") },
          { key: "orderDate", header: "Date", render: (i) => formatDate(String(i.orderDate)) },
          { key: "totalAmount", header: "Amount", render: (i) => formatCurrency(Number(i.totalAmount)) },
          { key: "status", header: "Status", render: (i) => <StatusBadge status={String(i.status)} /> },
        ]} />
      </CardContent></Card>
    </div>
  );
}
