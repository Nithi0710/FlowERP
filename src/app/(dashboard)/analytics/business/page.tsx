import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KPICard } from "@/components/ui/kpi-card";
import { calculateBusinessHealthScore } from "@/lib/services/inventory";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { requireAuth } from "@/lib/rbac";

export default async function BusinessAnalyticsPage() {
  const user = await requireAuth();
  const companyFilter = user.companyId ? { createdBy: { companyId: user.companyId } } : undefined;

  const [salesOrders, products, healthScore] = await Promise.all([
    prisma.salesOrder.findMany(companyFilter ? { where: companyFilter } : undefined),
    prisma.product.findMany(),
    calculateBusinessHealthScore(user.companyId ?? undefined),
  ]);

  const revenue = salesOrders.filter(o => o.status === "DELIVERED").reduce((s, o) => s + o.totalAmount, 0);
  const inventoryValue = products.reduce((s, p) => s + p.onHandQty * p.costPrice, 0);

  const monthlyRevenue = salesOrders.reduce((acc, o) => {
    const month = new Date(o.orderDate).toLocaleString("en", { month: "short" });
    acc[month] = (acc[month] || 0) + o.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business Analytics</h1>
        <p className="text-sm text-gray-500">Revenue, orders, and fulfillment metrics</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Revenue" value={revenue} prefix="₹" icon={<DollarSign className="h-5 w-5" />} color="text-emerald-600" />
        <KPICard title="Inventory Value" value={Math.round(inventoryValue)} prefix="₹" icon={<Package className="h-5 w-5" />} color="text-indigo-600" />
        <KPICard title="Total Orders" value={salesOrders.length} icon={<ShoppingCart className="h-5 w-5" />} color="text-blue-600" />
        <KPICard title="Fulfillment Rate" value={healthScore.fulfillmentRate} suffix="%" icon={<TrendingUp className="h-5 w-5" />} color="text-amber-600" />
      </div>
      <Card>
        <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <RevenueChart data={Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }))} />
        </CardContent>
      </Card>
    </div>
  );
}
