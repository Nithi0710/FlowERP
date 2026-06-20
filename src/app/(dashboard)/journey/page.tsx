import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { JourneyTimeline } from "@/components/special/journey-timeline";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

export default async function JourneyPage() {
  const [events, salesOrders] = await Promise.all([
    prisma.journeyEvent.findMany({
      orderBy: { createdAt: "asc" },
      include: { salesOrder: true },
    }),
    prisma.salesOrder.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const latestSO = salesOrders[0];
  const soEvents = latestSO
    ? events.filter((e) => e.salesOrderId === latestSO.id)
    : events.slice(0, 10);

  const defaultSteps = [
    { id: "1", stage: "SO Created", status: "COMPLETED" as const, message: "Sales order placed by customer" },
    { id: "2", stage: "Stock Checked", status: "COMPLETED" as const, message: "Inventory availability verified" },
    { id: "3", stage: "Shortage Detected", status: "COMPLETED" as const, message: "Procurement engine activated" },
    { id: "4", stage: "MO Generated", status: "COMPLETED" as const, message: "Manufacturing order completed" },
    { id: "5", stage: "Components Reserved", status: "COMPLETED" as const },
    { id: "6", stage: "Production Started", status: "COMPLETED" as const },
    { id: "7", stage: "Quality Check", status: "COMPLETED" as const },
    { id: "8", stage: "Finished Goods Produced", status: "COMPLETED" as const },
    { id: "9", stage: "Inventory Updated", status: "COMPLETED" as const },
    { id: "10", stage: "Delivered", status: "COMPLETED" as const },
  ];

  const timelineSteps =
    soEvents.length > 0
      ? soEvents.map((e) => ({
          id: e.id,
          stage: e.stage,
          status: e.status as "COMPLETED" | "RUNNING" | "WAITING" | "DELAYED",
          message: e.message || undefined,
          timestamp: formatDateTime(e.createdAt),
        }))
      : defaultSteps;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text">
          Demand To Delivery Journey
        </h1>
        <p className="mt-2 text-gray-500">
          Visual timeline of order fulfillment lifecycle
        </p>
        {latestSO && (
          <p className="mt-1 text-sm text-indigo-600">
            Tracking: {latestSO.orderNumber} — {latestSO.customer.name}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Journey Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <JourneyTimeline steps={timelineSteps} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={salesOrders as unknown as Record<string, unknown>[]}
              columns={[
                {
                  key: "orderNumber",
                  header: "Order",
                  render: (item) => String(item.orderNumber),
                },
                {
                  key: "customer",
                  header: "Customer",
                  render: (item) =>
                    String((item.customer as { name?: string })?.name || ""),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (item) => (
                    <StatusBadge status={String(item.status)} />
                  ),
                },
              ]}
              emptyMessage="No orders yet"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
