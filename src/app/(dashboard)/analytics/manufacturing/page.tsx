import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { KPICard } from "@/components/ui/kpi-card";
import { Factory, Clock, CheckCircle } from "lucide-react";
import { calculateBusinessHealthScore } from "@/lib/services/inventory";

export default async function ManufacturingAnalyticsPage() {
  const [mos, health] = await Promise.all([
    prisma.manufacturingOrder.findMany({ include: { product: true } }),
    calculateBusinessHealthScore(),
  ]);
  const completed = mos.filter(m => m.status === "COMPLETED").length;
  const delayed = mos.filter(m => m.status === "IN_PROGRESS" && m.startDate && m.startDate < new Date(Date.now()-7*86400000)).length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Manufacturing Analytics</h1></div>
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard title="Production Efficiency" value={health.manufacturingEfficiency} suffix="%" icon={<Factory className="h-5 w-5" />} color="text-indigo-600" />
        <KPICard title="Delayed Orders" value={delayed} icon={<Clock className="h-5 w-5" />} color="text-red-600" />
        <KPICard title="Completed MOs" value={completed} icon={<CheckCircle className="h-5 w-5" />} color="text-emerald-600" />
      </div>
      <Card><CardContent className="pt-6">
        <DataTable data={mos as unknown as Record<string, unknown>[]} columns={[
          { key: "orderNumber", header: "MO #" },
          { key: "product", header: "Product", render: (i) => String((i.product as {name?:string})?.name) },
          { key: "quantity", header: "Qty" },
          { key: "status", header: "Status" },
        ]} />
      </CardContent></Card>
    </div>
  );
}
