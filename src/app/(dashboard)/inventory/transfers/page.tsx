import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatDateTime } from "@/lib/utils";
import { KPICard } from "@/components/ui/kpi-card";
import { ArrowRightLeft, Package, TrendingUp, Clock } from "lucide-react";

export default async function StockTransfersPage() {
  const transfers = await prisma.stockLedger.findMany({
    where: { movementType: "STOCK_TRANSFER" },
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const totalQty = transfers.reduce((s, t) => s + Math.abs(t.quantity), 0);
  const uniqueProducts = new Set(transfers.map((t) => t.productId)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Transfers</h1>
        <p className="text-sm text-gray-500">Inter-warehouse stock movement history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Total Transfers"
          value={transfers.length}
          icon={<ArrowRightLeft className="h-5 w-5" />}
          color="text-indigo-600"
        />
        <KPICard
          title="Units Moved"
          value={totalQty}
          icon={<TrendingUp className="h-5 w-5" />}
          color="text-emerald-600"
        />
        <KPICard
          title="Products Affected"
          value={uniqueProducts}
          icon={<Package className="h-5 w-5" />}
          color="text-amber-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-indigo-500" />
            Transfer History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-indigo-50 p-4 dark:bg-indigo-900/20 mb-4">
                <ArrowRightLeft className="h-10 w-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Transfers Yet</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                Stock transfers will appear here once warehouse movements are recorded.
              </p>
            </div>
          ) : (
            <DataTable
              data={transfers as unknown as Record<string, unknown>[]}
              columns={[
                {
                  key: "reference",
                  header: "Transfer #",
                  render: (i) => (
                    <span className="font-medium text-indigo-600">{String(i.reference)}</span>
                  ),
                },
                {
                  key: "product",
                  header: "Product",
                  render: (i) => String((i.product as { name?: string })?.name ?? "-"),
                },
                {
                  key: "quantity",
                  header: "Quantity",
                  render: (i) => (
                    <span className="font-bold text-indigo-600">+{String(Math.abs(Number(i.quantity)))}</span>
                  ),
                },
                {
                  key: "notes",
                  header: "Notes",
                  render: (i) => String(i.notes ?? "-"),
                },
                {
                  key: "createdAt",
                  header: "Date",
                  render: (i) => formatDateTime(String(i.createdAt)),
                },
              ]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
