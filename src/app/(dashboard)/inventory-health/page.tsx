import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { KPICard, HealthScoreRing } from "@/components/ui/kpi-card";
import { InventoryStatusBadge } from "@/components/ui/badge";
import { calculateBusinessHealthScore } from "@/lib/services/inventory";
import { getHealthScoreStatus } from "@/lib/utils";
import { Package, AlertTriangle, TrendingUp } from "lucide-react";

export default async function InventoryHealthPage() {
  const [products, healthScore] = await Promise.all([
    prisma.product.findMany({ orderBy: { onHandQty: "asc" } }),
    calculateBusinessHealthScore(),
  ]);

  const lowStock = products.filter(p => p.onHandQty > 0 && p.onHandQty <= p.reorderLevel);
  const overstock = products.filter(p => p.onHandQty > p.reorderLevel * 5);
  const totalReserved = products.reduce((s, p) => s + p.reservedQty, 0);
  const healthStatus = getHealthScoreStatus(healthScore.inventoryHealth);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text">Inventory Health Center</h1>
        <p className="mt-2 text-gray-500">Stock health monitoring and alerts</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center p-6">
          <HealthScoreRing score={healthScore.inventoryHealth} />
          <p className={`mt-3 font-semibold ${healthStatus.color}`}>{healthStatus.label}</p>
        </Card>
        <KPICard title="Low Stock Items" value={lowStock.length} icon={<AlertTriangle className="h-5 w-5" />} color="text-amber-600" />
        <KPICard title="Overstock Items" value={overstock.length} icon={<TrendingUp className="h-5 w-5" />} color="text-blue-600" />
        <KPICard title="Reserved Stock" value={totalReserved} icon={<Package className="h-5 w-5" />} color="text-indigo-600" />
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={products as unknown as Record<string, unknown>[]} columns={[
          { key: "name", header: "Product" },
          { key: "onHandQty", header: "On Hand" },
          { key: "reservedQty", header: "Reserved" },
          { key: "reorderLevel", header: "Reorder Level" },
          { key: "status", header: "Status", render: (i) => (
            <InventoryStatusBadge onHand={Number(i.onHandQty)} reorderLevel={Number(i.reorderLevel)} />
          )},
        ]} />
      </CardContent></Card>
    </div>
  );
}
