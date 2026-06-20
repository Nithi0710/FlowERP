import { prisma } from "@/lib/prisma";
import { GlassCard, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ControlTowerFlow } from "@/components/special/control-tower-flow";
import { KPICard } from "@/components/ui/kpi-card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Radio,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react";

async function getControlTowerData() {
  const [
    salesOrders,
    confirmedSOs,
    activeMOs,
    pendingWOs,
    inProgressWOs,
    pendingProcurement,
    recentDeliveries,
    qualityCheckMOs,
  ] = await Promise.all([
    prisma.salesOrder.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.salesOrder.count({
      where: { status: { in: ["CONFIRMED", "PARTIALLY_DELIVERED"] } },
    }),
    prisma.manufacturingOrder.count({
      where: { status: { in: ["IN_PROGRESS", "CONFIRMED", "QUALITY_CHECK"] } },
    }),
    prisma.workOrder.count({ where: { status: "PENDING" } }),
    prisma.workOrder.count({ where: { status: "IN_PROGRESS" } }),
    prisma.procurementQueue.count({ where: { status: "PENDING" } }),
    prisma.delivery.count(),
    prisma.manufacturingOrder.count({ where: { status: "QUALITY_CHECK" } }),
  ]);

  const delayedMOs = await prisma.manufacturingOrder.count({
    where: {
      status: { in: ["IN_PROGRESS", "CONFIRMED"] },
      startDate: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });

  const stages = [
    {
      id: "customer-order",
      label: "Customer Order",
      status: confirmedSOs > 0 ? ("RUNNING" as const) : ("WAITING" as const),
      count: confirmedSOs,
      detail: `${salesOrders} total orders`,
    },
    {
      id: "inventory-check",
      label: "Inventory Check",
      status: confirmedSOs > 0 ? ("RUNNING" as const) : ("COMPLETED" as const),
      count: confirmedSOs,
    },
    {
      id: "stock-availability",
      label: "Stock Availability",
      status:
        pendingProcurement > 0 ? ("DELAYED" as const) : ("COMPLETED" as const),
      count: pendingProcurement,
      detail: pendingProcurement > 0 ? `${pendingProcurement} shortages` : "All stocked",
    },
    {
      id: "procurement",
      label: "Procurement Engine",
      status:
        pendingProcurement > 0 ? ("RUNNING" as const) : ("COMPLETED" as const),
      count: pendingProcurement,
    },
    {
      id: "manufacturing",
      label: "Manufacturing",
      status: activeMOs > 0 ? ("RUNNING" as const) : ("WAITING" as const),
      count: activeMOs,
      detail: `${inProgressWOs} work orders active`,
    },
    {
      id: "quality-check",
      label: "Quality Check",
      status:
        qualityCheckMOs > 0 ? ("RUNNING" as const) : ("WAITING" as const),
      count: qualityCheckMOs,
    },
    {
      id: "warehouse",
      label: "Warehouse",
      status: "COMPLETED" as const,
      count: recentDeliveries,
    },
    {
      id: "delivery",
      label: "Delivery",
      status:
        confirmedSOs > 0 ? ("RUNNING" as const) : ("WAITING" as const),
      count: recentDeliveries,
    },
  ];

  const recentEvents = await prisma.journeyEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { salesOrder: true },
  });

  return {
    stages,
    recentEvents,
    stats: {
      activeOrders: confirmedSOs,
      activeMOs,
      pendingWOs,
      delayedMOs,
    },
  };
}

export default async function ControlTowerPage() {
  const data = await getControlTowerData();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          <Radio className="h-4 w-4 animate-pulse" />
          Live Operations
        </div>
        <h1 className="mt-4 text-3xl font-bold gradient-text">
          ERP Control Tower
        </h1>
        <p className="mt-2 text-gray-500">
          Real-time business operations flow — Demand to Delivery
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Active Orders"
          value={data.stats.activeOrders}
          icon={<Activity className="h-5 w-5" />}
          color="text-indigo-600"
        />
        <KPICard
          title="Manufacturing"
          value={data.stats.activeMOs}
          icon={<Activity className="h-5 w-5" />}
          color="text-blue-600"
        />
        <KPICard
          title="Pending Work Orders"
          value={data.stats.pendingWOs}
          icon={<Clock className="h-5 w-5" />}
          color="text-amber-600"
        />
        <KPICard
          title="Delayed"
          value={data.stats.delayedMOs}
          icon={<CheckCircle className="h-5 w-5" />}
          color="text-red-600"
        />
      </div>

      <GlassCard className="p-8">
        <ControlTowerFlow stages={data.stages} />
      </GlassCard>

      <Card>
        <CardHeader>
          <CardTitle>Live Event Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data.recentEvents as unknown as Record<string, unknown>[]}
            columns={[
              {
                key: "stage",
                header: "Stage",
                render: (item) => (
                  <span className="font-medium">{String(item.stage)}</span>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (item) => (
                  <StatusBadge status={String(item.status)} />
                ),
              },
              { key: "message", header: "Details" },
              {
                key: "createdAt",
                header: "Time",
                render: (item) => formatDate(String(item.createdAt)),
              },
            ]}
            emptyMessage="No events yet — confirm a sales order to see the flow"
          />
        </CardContent>
      </Card>
    </div>
  );
}
