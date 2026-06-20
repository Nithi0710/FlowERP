import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { InventoryStatusBadge } from "@/components/ui/badge";
import { formatCurrency, calculateFreeQty } from "@/lib/utils";
import { KPICard } from "@/components/ui/kpi-card";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";
import { ProductTableClient } from "./product-table-client";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const totalValue = products.reduce(
    (sum, p) => sum + p.onHandQty * p.costPrice,
    0
  );
  const healthy = products.filter((p) => p.onHandQty > p.reorderLevel).length;
  const lowStock = products.filter(
    (p) => p.onHandQty > 0 && p.onHandQty <= p.reorderLevel
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventory Overview</h1>
        <p className="text-sm text-gray-500">Real-time stock levels and health status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total Products"
          value={products.length}
          icon={<Package className="h-5 w-5" />}
          color="text-indigo-600"
        />
        <KPICard
          title="Inventory Value"
          value={Math.round(totalValue)}
          prefix="₹"
          icon={<Package className="h-5 w-5" />}
          color="text-emerald-600"
        />
        <KPICard
          title="Low Stock"
          value={lowStock}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-amber-600"
        />
        <KPICard
          title="Healthy"
          value={healthy}
          icon={<CheckCircle className="h-5 w-5" />}
          color="text-emerald-600"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <ProductTableClient products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
