import { prisma } from "@/lib/prisma";
import { calculateBusinessHealthScore } from "@/lib/services/inventory";
import { GlassCard, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KPICard, HealthScoreRing } from "@/components/ui/kpi-card";
import { getHealthScoreStatus } from "@/lib/utils";
import {
  DollarSign,
  Package,
  Clock,
  Factory,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { RevenueChart, OrderPieChart } from "@/components/charts/revenue-chart";
import { requireAuth } from "@/lib/rbac";

async function getWarRoomData(companyId?: string) {
  const companyFilter = companyId
    ? { createdBy: { companyId } }
    : undefined;

  const [
    products,
    salesOrders,
    manufacturingOrders,
    purchaseOrders,
    healthScore,
  ] = await Promise.all([
    prisma.product.findMany(),
    prisma.salesOrder.findMany({
      where: companyFilter,
      include: { customer: true },
    }),
    prisma.manufacturingOrder.findMany({
      where: {
        status: { not: "COMPLETED" },
        ...(companyFilter ? companyFilter : {}),
      },
    }),
    prisma.purchaseOrder.findMany({ where: companyFilter }),
    calculateBusinessHealthScore(companyId),
  ]);

  const revenue = salesOrders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const inventoryValue = products.reduce(
    (sum, p) => sum + p.onHandQty * p.costPrice,
    0
  );

  const procurementCost = purchaseOrders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  const delayedOrders = manufacturingOrders.filter(
    (o) =>
      o.startDate &&
      o.startDate < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const orderStatusData = [
    { name: "Delivered", value: salesOrders.filter((o) => o.status === "DELIVERED").length, color: "#10b981" },
    { name: "Confirmed", value: salesOrders.filter((o) => o.status === "CONFIRMED").length, color: "#3b82f6" },
    { name: "Draft", value: salesOrders.filter((o) => o.status === "DRAFT").length, color: "#6b7280" },
    { name: "Partial", value: salesOrders.filter((o) => o.status === "PARTIALLY_DELIVERED").length, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  const monthlyRevenue = salesOrders.reduce(
    (acc, o) => {
      const month = new Date(o.orderDate).toLocaleString("en", { month: "short" });
      acc[month] = (acc[month] || 0) + o.totalAmount;
      return acc;
    },
    {} as Record<string, number>
  );

  const revenueChart = Object.entries(monthlyRevenue).map(([month, amount]) => ({
    month,
    revenue: amount,
  }));

  return {
    revenue,
    inventoryValue,
    delayedOrders,
    procurementCost,
    healthScore,
    orderStatusData,
    revenueChart,
    fulfillmentRate: healthScore.fulfillmentRate,
    manufacturingEfficiency: healthScore.manufacturingEfficiency,
  };
}

export default async function WarRoomPage() {
  const user = await requireAuth();
  const data = await getWarRoomData(user.companyId ?? undefined);
  const healthStatus = getHealthScoreStatus(data.healthScore.overall);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text">Executive War Room</h1>
        <p className="mt-2 text-gray-500">CEO Dashboard — Strategic Business Intelligence</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KPICard title="Revenue" value={data.revenue} prefix="₹" icon={<DollarSign className="h-5 w-5" />} color="text-emerald-600" />
        <KPICard title="Inventory Value" value={Math.round(data.inventoryValue)} prefix="₹" icon={<Package className="h-5 w-5" />} color="text-indigo-600" />
        <KPICard title="Delayed Orders" value={data.delayedOrders} icon={<Clock className="h-5 w-5" />} color="text-red-600" />
        <KPICard title="Mfg Efficiency" value={data.manufacturingEfficiency} suffix="%" icon={<Factory className="h-5 w-5" />} color="text-blue-600" />
        <KPICard title="Procurement Cost" value={Math.round(data.procurementCost)} prefix="₹" icon={<ShoppingBag className="h-5 w-5" />} color="text-amber-600" />
        <KPICard title="Fulfillment" value={data.fulfillmentRate} suffix="%" icon={<TrendingUp className="h-5 w-5" />} color="text-emerald-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard>
          <CardHeader><CardTitle>Business Health</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
            <HealthScoreRing score={data.healthScore.overall} size={140} />
            <p className={`mt-3 text-lg font-semibold ${healthStatus.color}`}>{healthStatus.label}</p>
          </CardContent>
        </GlassCard>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <RevenueChart data={data.revenueChart} />
          </CardContent>
        </Card>
      </div>

      {data.orderStatusData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Order Distribution</CardTitle></CardHeader>
          <CardContent className="flex justify-center">
            <OrderPieChart data={data.orderStatusData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
