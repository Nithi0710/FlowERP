import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MOActions } from "@/components/actions/mo-actions";
import { requireAuth } from "@/lib/rbac";

export default async function ManufacturingOrdersPage() {
  const user = await requireAuth();
  const orders = await prisma.manufacturingOrder.findMany({
    where: { createdBy: { companyId: user.companyId ?? undefined } },
    include: {
      product: true,
      workOrders: { include: { operation: true, workCenter: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manufacturing Orders</h1>
          <p className="text-sm text-gray-500">Production orders and work order management</p>
        </div>
        <Link href="/manufacturing/orders/new">
          <Button>Create MO</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={orders as unknown as Record<string, unknown>[]}
            columns={[
              {
                key: "orderNumber",
                header: "MO #",
                render: (item) => (
                  <span className="font-medium text-indigo-600">
                    {String(item.orderNumber)}
                  </span>
                ),
              },
              {
                key: "product",
                header: "Product",
                render: (item) =>
                  String((item.product as { name?: string })?.name || ""),
              },
              {
                key: "quantity",
                header: "Qty",
                render: (item) => String(item.quantity),
              },
              {
                key: "status",
                header: "Status",
                render: (item) => <StatusBadge status={String(item.status)} />,
              },
              {
                key: "workOrders",
                header: "Work Orders",
                render: (item) => {
                  const wos = item.workOrders as { status: string }[];
                  const completed = wos.filter((w) => w.status === "COMPLETED").length;
                  return `${completed}/${wos.length}`;
                },
              },
              {
                key: "createdAt",
                header: "Created",
                render: (item) => formatDate(String(item.createdAt)),
              },
              {
                key: "actions",
                header: "Actions",
                render: (item) => (
                  <MOActions
                    orderId={String(item.id)}
                    status={String(item.status)}
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
