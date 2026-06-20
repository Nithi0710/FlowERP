import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";

export default async function DeliveriesPage() {
  const items = await prisma.delivery.findMany({
    include: { salesOrder: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Deliveries</h1><p className="text-sm text-gray-500">Sales order deliveries</p></div>
      <Card><CardContent className="pt-6">
        <DataTable data={items as unknown as Record<string, unknown>[]} columns={[
          { key: "deliveryNumber", header: "Delivery #" },
          { key: "so", header: "Sales Order", render: (i) => String((i.salesOrder as {orderNumber?:string})?.orderNumber) },
          { key: "customer", header: "Customer", render: (i) => String(((i.salesOrder as {customer?:{name?:string}})?.customer)?.name) },
          { key: "deliveryDate", header: "Date", render: (i) => formatDate(String(i.deliveryDate)) },
        ]} />
      </CardContent></Card>
    </div>
  );
}
