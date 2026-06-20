import { prisma } from "@/lib/prisma";
import { calculateBusinessHealthScore } from "@/lib/services/inventory";
import { KPICard, HealthScoreRing } from "@/components/ui/kpi-card";
import { GlassCard, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge, InventoryStatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getHealthScoreStatus } from "@/lib/utils";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Factory,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/rbac";

async function getDashboardData(companyId?: string) {
  const companyFilter = companyId
    ? { createdBy: { companyId } }
    : undefined;

  const [
    products,
    salesOrders,
    purchaseOrders,
    manufacturingOrders,
    recentLedger,
    healthScore,
    lowStockProducts,
  ] = await Promise.all([
    prisma.product.findMany({ include: { category: true } }),
    prisma.salesOrder.findMany({
      where: companyFilter,
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.purchaseOrder.count({ where: companyFilter }),
    prisma.manufacturingOrder.findMany({
      where: {
        status: { in: ["IN_PROGRESS", "CONFIRMED"] },
        ...(companyFilter ? companyFilter : {}),
      },
    }),
    prisma.stockLedger.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    calculateBusinessHealthScore(companyId),
    prisma.product.findMany({
      orderBy: { onHandQty: "asc" },
      take: 5,
    }),
  ]);

  const totalRevenue = salesOrders
    .filter((o) => o.status === "DELIVERED" || o.status === "PARTIALLY_DELIVERED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const inventoryValue = products.reduce(
    (sum, p) => sum + p.onHandQty * p.costPrice,
    0
  );

  const deliveredCount = await prisma.salesOrder.count({
    where: {
      status: "DELIVERED",
      ...(companyFilter ? companyFilter : {}),
    },
  });
  const totalSOCount = await prisma.salesOrder.count({
    where: companyFilter,
  });
  const fulfillmentRate =
    totalSOCount > 0 ? Math.round((deliveredCount / totalSOCount) * 100) : 0;

  return {
    products,
    salesOrders,
    purchaseOrderCount: purchaseOrders,
    activeMOs: manufacturingOrders.length,
    recentLedger,
    healthScore,
    lowStockProducts,
    totalRevenue,
    inventoryValue,
    fulfillmentRate,
  };
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const data = await getDashboardData(user.companyId ?? undefined);
  const healthStatus = getHealthScoreStatus(data.healthScore.overall);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            {user.companyName || "Business"} — Business Overview
          </p>
        </div>
        <Link href="/control-tower">
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Control Tower
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={data.totalRevenue}
          prefix="₹"
          icon={<DollarSign className="h-5 w-5" />}
          color="text-emerald-600"
          delay={0}
        />
        <KPICard
          title="Inventory Value"
          value={Math.round(data.inventoryValue)}
          prefix="₹"
          icon={<Package className="h-5 w-5" />}
          color="text-indigo-600"
          delay={0.1}
        />
        <KPICard
          title="Active Orders"
          value={data.salesOrders.length}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="text-blue-600"
          delay={0.2}
        />
        <KPICard
          title="Fulfillment Rate"
          value={data.fulfillmentRate}
          suffix="%"
          icon={<Factory className="h-5 w-5" />}
          color="text-amber-600"
          delay={0.3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Business Health Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <HealthScoreRing score={data.healthScore.overall} />
            <p className={`mt-4 text-lg font-semibold ${healthStatus.color}`}>
              {healthStatus.label}
            </p>
            <div className="mt-4 w-full space-y-2">
              {[
                { label: "Inventory", value: data.healthScore.inventoryHealth },
                { label: "Fulfillment", value: data.healthScore.fulfillmentRate },
                { label: "Manufacturing", value: data.healthScore.manufacturingEfficiency },
                { label: "Procurement", value: data.healthScore.procurementEfficiency },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Sales Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data.salesOrders as unknown as Record<string, unknown>[]}
              columns={[
                {
                  key: "orderNumber",
                  header: "Order #",
                  render: (item) => (
                    <span className="font-medium text-indigo-600">
                      {String(item.orderNumber)}
                    </span>
                  ),
                },
                {
                  key: "customer",
                  header: "Customer",
                  render: (item) =>
                    String((item.customer as { name?: string })?.name || ""),
                },
                {
                  key: "totalAmount",
                  header: "Amount",
                  render: (item) => formatCurrency(Number(item.totalAmount)),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (item) => (
                    <StatusBadge status={String(item.status)} />
                  ),
                },
                {
                  key: "orderDate",
                  header: "Date",
                  render: (item) => formatDate(String(item.orderDate)),
                },
              ]}
              emptyMessage="No sales orders yet"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
            <Link href="/inventory">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data.lowStockProducts as unknown as Record<string, unknown>[]}
              columns={[
                { key: "name", header: "Product" },
                { key: "sku", header: "SKU" },
                {
                  key: "onHandQty",
                  header: "On Hand",
                  render: (item) => String(item.onHandQty),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (item) => (
                    <InventoryStatusBadge
                      onHand={Number(item.onHandQty)}
                      reorderLevel={Number(item.reorderLevel)}
                    />
                  ),
                },
              ]}
              emptyMessage="All products are healthy"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data.recentLedger as unknown as Record<string, unknown>[]}
              columns={[
                {
                  key: "product",
                  header: "Product",
                  render: (item) =>
                    String((item.product as { name?: string })?.name || ""),
                },
                {
                  key: "quantity",
                  header: "Qty",
                  render: (item) => {
                    const qty = Number(item.quantity);
                    return (
                      <span
                        className={
                          qty > 0
                            ? "text-emerald-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {qty > 0 ? "+" : ""}
                        {qty}
                      </span>
                    );
                  },
                },
                { key: "reference", header: "Reference" },
                {
                  key: "createdAt",
                  header: "Time",
                  render: (item) => formatDate(String(item.createdAt)),
                },
              ]}
              emptyMessage="No stock movements yet"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
