import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";

export default async function PurchaseReceiptsPage() {
  const orders = await prisma.purchaseOrder.findMany({
    where: { status: { in: ["CONFIRMED", "RECEIVED", "PARTIALLY_RECEIVED"] } },
    include: { vendor: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Purchase Receipts</h1>
        <p className="text-sm text-gray-500">Goods receipt against purchase orders</p>
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={orders as unknown as Record<string, unknown>[]} columns={[
          { key: "orderNumber", header: "PO #" },
          { key: "vendor", header: "Vendor", render: (i) => String((i.vendor as { name?: string })?.name ?? "-") },
          { key: "orderDate", header: "Order Date", render: (i) => formatDate(String(i.orderDate)) },
          { key: "expectedDate", header: "Expected", render: (i) => i.expectedDate ? formatDate(String(i.expectedDate)) : "—" },
          { key: "status", header: "Receipt Status", render: (i) => <StatusBadge status={String(i.status)} /> },
        ]} />
      </CardContent></Card>
    </div>
  );
}
