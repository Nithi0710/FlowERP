import { prisma } from "@/lib/prisma";
import { OperationsCrud } from "@/components/masters/operations-crud";
import { canAccess } from "@/lib/rbac";

export default async function OperationsPage() {
  const [items, workCenters, canWrite] = await Promise.all([
    prisma.operation.findMany({
      where: { bomId: null },
      include: { workCenter: true },
      orderBy: [{ sequence: "asc" }, { name: "asc" }],
    }),
    prisma.workCenter.findMany({ orderBy: { name: "asc" } }),
    canAccess("masters:operations"),
  ]);

  return <OperationsCrud items={items} workCenters={workCenters} canWrite={canWrite} />;
}
