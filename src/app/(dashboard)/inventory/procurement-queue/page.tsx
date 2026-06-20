import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/ui/kpi-card";
import { Package, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default async function ProcurementQueuePage() {
  const queue = await prisma.procurementQueue.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const pending = queue.filter((q) => q.status === "PENDING").length;
  const completed = queue.filter((q) => q.status === "COMPLETED").length;
  const totalShortage = queue.reduce((s, q) => s + q.shortage, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Procurement Recommendation Center
        </h1>
        <p className="text-sm text-gray-500">Automated shortage detection and suggested actions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Pending Items"
          value={pending}
          icon={<Clock className="h-5 w-5" />}
          color="text-amber-600"
        />
        <KPICard
          title="Total Shortage"
          value={Math.round(totalShortage)}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="text-red-600"
        />
        <KPICard
          title="Completed"
          value={completed}
          icon={<CheckCircle className="h-5 w-5" />}
          color="text-emerald-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-500" />
            Procurement Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-emerald-50 p-4 dark:bg-emerald-900/20 mb-4">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">All Stock Healthy</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                No procurement actions needed — all inventory levels are within acceptable thresholds.
              </p>
            </div>
          ) : (
            <DataTable
              data={queue as unknown as Record<string, unknown>[]}
              columns={[
                {
                  key: "product",
                  header: "Product",
                  render: (i) => (
                    <span className="font-medium">
                      {String((i.product as { name?: string })?.name ?? "-")}
                    </span>
                  ),
                },
                {
                  key: "currentStock",
                  header: "Current Stock",
                  render: (i) => <span className="text-gray-600">{String(i.currentStock)}</span>,
                },
                {
                  key: "requiredQty",
                  header: "Required",
                  render: (i) => String(i.requiredQty),
                },
                {
                  key: "shortage",
                  header: "Shortage",
                  render: (i) => (
                    <span className="font-bold text-red-600">{String(i.shortage)}</span>
                  ),
                },
                {
                  key: "suggestedAction",
                  header: "Action",
                  render: (i) => (
                    <Badge
                      variant={
                        String(i.suggestedAction) === "MANUFACTURING" ? "default" : "warning"
                      }
                    >
                      {String(i.suggestedAction) === "MANUFACTURING" ? "Create MO" : "Create PO"}
                    </Badge>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (i) => (
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        String(i.status) === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {String(i.status)}
                    </span>
                  ),
                },
              ]}
              emptyMessage="No procurement needs — all stock levels healthy"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
