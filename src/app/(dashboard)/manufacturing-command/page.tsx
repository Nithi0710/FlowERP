import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { Factory, Clock, CheckCircle, Activity } from "lucide-react";
import { requireAuth } from "@/lib/rbac";

export default async function ManufacturingCommandPage() {
  const user = await requireAuth();
  const companyFilter = user.companyId ? { createdBy: { companyId: user.companyId } } : undefined;

  const [mos, workOrders, workCenters] = await Promise.all([
    prisma.manufacturingOrder.findMany({
      where: {
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        ...(companyFilter ? companyFilter : {}),
      },
      include: { product: true, workOrders: true },
    }),
    prisma.workOrder.findMany({
      where: companyFilter ? { manufacturingOrder: companyFilter } : undefined,
      include: { operation: true, workCenter: true, manufacturingOrder: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.workCenter.findMany({ include: { workOrders: { where: { status: "IN_PROGRESS" } } } }),
  ]);

  const inProgress = workOrders.filter(w => w.status === "IN_PROGRESS").length;
  const delayed = workOrders.filter(w => w.status === "IN_PROGRESS" && w.startDate && w.startDate < new Date(Date.now() - 2*24*60*60*1000)).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text">Manufacturing Command Center</h1>
        <p className="mt-2 text-gray-500">Real-time production monitoring</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Active MOs" value={mos.length} icon={<Factory className="h-5 w-5" />} color="text-indigo-600" />
        <KPICard title="Work Orders" value={workOrders.length} icon={<Activity className="h-5 w-5" />} color="text-blue-600" />
        <KPICard title="In Progress" value={inProgress} icon={<Clock className="h-5 w-5" />} color="text-amber-600" />
        <KPICard title="Delayed" value={delayed} icon={<CheckCircle className="h-5 w-5" />} color="text-red-600" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Work Centers</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {workCenters.map(wc => {
              const utilization = Math.round((wc.workOrders.length / wc.capacity) * 100);
              return (
                <div key={wc.id} className="rounded-lg border p-4 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">{wc.name}</span>
                    <span className="text-sm text-gray-500">{wc.workOrders.length}/{wc.capacity} jobs</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(utilization, 100)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{utilization}% utilization</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Active Work Orders</CardTitle></CardHeader>
          <CardContent>
            <DataTable data={workOrders.slice(0, 10) as unknown as Record<string, unknown>[]} columns={[
              { key: "workOrderNumber", header: "WO #" },
              { key: "operation", header: "Operation", render: (i) => String((i.operation as {name?:string})?.name || "-") },
              { key: "workCenter", header: "Center", render: (i) => String((i.workCenter as {name?:string})?.name || "-") },
              { key: "status", header: "Status", render: (i) => <StatusBadge status={String(i.status)} /> },
            ]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
