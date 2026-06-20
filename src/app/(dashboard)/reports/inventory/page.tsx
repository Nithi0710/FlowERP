import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { calculateFreeQty } from "@/lib/utils";
import { InventoryStatusBadge } from "@/components/ui/badge";

export default async function InventoryReportsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const lowStock = products.filter((p) => calculateFreeQty(p.onHandQty, p.reservedQty) <= p.reorderLevel);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Reports</h1>
        <p className="text-sm text-gray-500">Stock levels, availability, and reorder alerts</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total SKUs</p><p className="text-2xl font-bold">{products.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Low Stock Items</p><p className="text-2xl font-bold text-amber-600">{lowStock.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-500">Total On Hand</p><p className="text-2xl font-bold">{products.reduce((s, p) => s + p.onHandQty, 0).toFixed(0)}</p></CardContent></Card>
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={products as unknown as Record<string, unknown>[]} columns={[
          { key: "sku", header: "SKU" },
          { key: "name", header: "Product" },
          { key: "category", header: "Category", render: (i) => String((i.category as { name?: string })?.name ?? "-") },
          { key: "onHandQty", header: "On Hand" },
          { key: "reservedQty", header: "Reserved" },
          { key: "status", header: "Status", render: (i) => (
            <InventoryStatusBadge
              onHand={Number(i.onHandQty)}
              reorderLevel={Number(i.reorderLevel)}
            />
          )},
        ]} />
      </CardContent></Card>
    </div>
  );
}
