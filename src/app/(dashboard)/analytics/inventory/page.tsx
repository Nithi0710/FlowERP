import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { InventoryStatusBadge } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { Package, TrendingUp, TrendingDown } from "lucide-react";

export default async function InventoryAnalyticsPage() {
  const products = await prisma.product.findMany({ orderBy: { onHandQty: "desc" } });
  const fastMoving = products.slice(0, 5);
  const slowMoving = [...products].sort((a,b) => a.onHandQty - b.onHandQty).slice(0, 5);
  const lowStock = products.filter(p => p.onHandQty <= p.reorderLevel);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Inventory Analytics</h1></div>
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Total SKUs" value={products.length} icon={<Package className="h-5 w-5" />} color="text-indigo-600" />
        <KPICard title="Fast Moving" value={fastMoving.length} icon={<TrendingUp className="h-5 w-5" />} color="text-emerald-600" />
        <KPICard title="Slow Moving" value={slowMoving.length} icon={<TrendingDown className="h-5 w-5" />} color="text-amber-600" />
        <KPICard title="Low Stock" value={lowStock.length} icon={<TrendingDown className="h-5 w-5" />} color="text-red-600" />
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={lowStock as unknown as Record<string, unknown>[]} columns={[
          { key: "name", header: "Product" },
          { key: "onHandQty", header: "On Hand" },
          { key: "reorderLevel", header: "Reorder Level" },
          { key: "status", header: "Status", render: (i) => <InventoryStatusBadge onHand={Number(i.onHandQty)} reorderLevel={Number(i.reorderLevel)} /> },
        ]} emptyMessage="All products healthy" />
      </CardContent></Card>
    </div>
  );
}
