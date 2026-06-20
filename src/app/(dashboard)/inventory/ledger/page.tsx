import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatDate } from "@/lib/utils";

export default async function StockLedgerPage() {
  const entries = await prisma.stockLedger.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const movementColors: Record<string, string> = {
    SALES_DELIVERY: "text-red-600",
    PURCHASE_RECEIPT: "text-emerald-600",
    MANUFACTURING_CONSUME: "text-red-600",
    MANUFACTURING_PRODUCE: "text-blue-600",
    STOCK_TRANSFER: "text-indigo-600",
    ADJUSTMENT: "text-amber-600",
    RESERVATION: "text-amber-600",
    RELEASE: "text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Ledger</h1>
        <p className="text-sm text-gray-500">
          Complete audit trail of all inventory movements
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={entries as unknown as Record<string, unknown>[]}
            columns={[
              {
                key: "createdAt",
                header: "Timestamp",
                render: (item) => formatDate(String(item.createdAt)),
              },
              {
                key: "product",
                header: "Product",
                render: (item) =>
                  String((item.product as { name?: string })?.name || ""),
              },
              {
                key: "quantity",
                header: "Quantity",
                render: (item) => {
                  const qty = Number(item.quantity);
                  const type = String(item.movementType);
                  return (
                    <span className={`font-bold ${movementColors[type] || ""}`}>
                      {qty > 0 ? "+" : ""}
                      {qty}
                    </span>
                  );
                },
              },
              {
                key: "movementType",
                header: "Type",
                render: (item) => {
                  const type = String(item.movementType);
                  return (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        type.includes("MANUFACTURING")
                          ? "bg-blue-100 text-blue-700"
                          : Number(item.quantity) > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {type.replace(/_/g, " ")}
                    </span>
                  );
                },
              },
              { key: "reference", header: "Reference" },
              {
                key: "balanceAfter",
                header: "Balance",
                render: (item) => String(item.balanceAfter),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
