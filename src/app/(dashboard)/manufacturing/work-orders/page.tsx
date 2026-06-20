import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";

export default async function WorkOrdersPage() {
  const orders = await prisma.workOrder.findMany({
    include: {
      operation: true,
      workCenter: true,
      assignee: true,
      manufacturingOrder: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <p className="text-sm text-gray-500">Individual manufacturing operations</p>
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={orders as unknown as Record<string, unknown>[]} columns={[
          { key: "workOrderNumber", header: "WO #", render: (i) => <span className="font-medium text-indigo-600">{String(i.workOrderNumber)}</span> },
          { key: "mo", header: "MO", render: (i) => String((i.manufacturingOrder as {orderNumber?:string})?.orderNumber) },
          { key: "product", header: "Product", render: (i) => String(((i.manufacturingOrder as {product?:{name?:string}})?.product)?.name) },
          { key: "operation", header: "Operation", render: (i) => String((i.operation as {name?:string})?.name || "-") },
          { key: "workCenter", header: "Work Center", render: (i) => String((i.workCenter as {name?:string})?.name || "-") },
          { key: "status", header: "Status", render: (i) => <StatusBadge status={String(i.status)} /> },
        ]} />
      </CardContent></Card>
    </div>
  );
}
