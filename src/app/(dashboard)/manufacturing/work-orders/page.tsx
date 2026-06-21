import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { WorkOrderProgress } from "@/components/manufacturing/work-order-progress";
import { StatusBadge } from "@/components/ui/badge";
import { WorkOrderCreateDialog } from "@/components/manufacturing/work-order-create-dialog";
import { requireAuth } from "@/lib/rbac";

export default async function WorkOrdersPage() {
  const user = await requireAuth();

  const manufacturingOrders = await prisma.manufacturingOrder.findMany({
    where: {
      status: { in: ["CONFIRMED", "IN_PROGRESS"] },
    },
    include: {
      product: true,
      workOrders: {
        include: {
          operation: true,
          workCenter: true,
        },
        orderBy: { sequence: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Work Order Progress</h1>
          <p className="text-sm text-gray-500">Track operations and work centre status for active manufacturing orders</p>
        </div>
        <WorkOrderCreateDialog products={products} userId={user.id} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {manufacturingOrders.map((mo) => (
          <Card key={mo.id}>
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{mo.orderNumber}</CardTitle>
                  <p className="text-sm font-medium mt-1">Product: {mo.product.name}</p>
                  <p className="text-sm text-gray-500">Qty: {mo.quantity}</p>
                </div>
                <StatusBadge status={mo.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <WorkOrderProgress workOrders={mo.workOrders as any[]} />
            </CardContent>
          </Card>
        ))}

        {manufacturingOrders.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No active manufacturing orders found. Create and confirm an order to track its progress.
          </div>
        )}
      </div>
    </div>
  );
}
