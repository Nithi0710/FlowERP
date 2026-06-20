import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { OrderActions } from "@/components/actions/order-actions";
import { requireAuth } from "@/lib/rbac";

export default async function SalesOrdersPage() {
  const user = await requireAuth();
  const orders = await prisma.salesOrder.findMany({
    where: { createdBy: { companyId: user.companyId ?? undefined } },
    include: {
      customer: true,
      lines: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Orders</h1>
          <p className="text-sm text-gray-500">Manage customer orders and deliveries</p>
        </div>
        <Link href="/sales/orders/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={orders as unknown as Record<string, unknown>[]}
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
                key: "lines",
                header: "Items",
                render: (item) => {
                  const lines = item.lines as { product: { name: string }; quantity: number }[];
                  return `${lines.length} item(s)`;
                },
              },
              {
                key: "totalAmount",
                header: "Amount",
                render: (item) => formatCurrency(Number(item.totalAmount)),
              },
              {
                key: "status",
                header: "Status",
                render: (item) => <StatusBadge status={String(item.status)} />,
              },
              {
                key: "orderDate",
                header: "Date",
                render: (item) => formatDate(String(item.orderDate)),
              },
              {
                key: "actions",
                header: "Actions",
                render: (item) => (
                  <OrderActions
                    orderId={String(item.id)}
                    status={String(item.status)}
                    lines={
                      (item.lines as { id: string; quantity: number; deliveredQty: number }[]) || []
                    }
                  />
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
