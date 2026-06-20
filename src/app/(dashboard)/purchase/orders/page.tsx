import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { POActions } from "@/components/actions/po-actions";
import { requireAuth } from "@/lib/rbac";

export default async function PurchaseOrdersPage() {
  const user = await requireAuth();
  const orders = await prisma.purchaseOrder.findMany({
    where: { createdBy: { companyId: user.companyId ?? undefined } },
    include: { vendor: true, lines: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <p className="text-sm text-gray-500">Manage procurement orders</p>
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={orders as unknown as Record<string, unknown>[]} columns={[
          { key: "orderNumber", header: "PO #", render: (i) => <span className="font-medium text-indigo-600">{String(i.orderNumber)}</span> },
          { key: "vendor", header: "Vendor", render: (i) => String((i.vendor as {name?:string})?.name) },
          { key: "totalAmount", header: "Amount", render: (i) => formatCurrency(Number(i.totalAmount)) },
          { key: "status", header: "Status", render: (i) => <StatusBadge status={String(i.status)} /> },
          { key: "orderDate", header: "Date", render: (i) => formatDate(String(i.orderDate)) },
          { key: "actions", header: "Actions", render: (i) => (
            <POActions orderId={String(i.id)} status={String(i.status)} lines={(i.lines as {id:string;quantity:number;receivedQty:number}[])||[]} />
          )},
        ]} />
      </CardContent></Card>
    </div>
  );
}
