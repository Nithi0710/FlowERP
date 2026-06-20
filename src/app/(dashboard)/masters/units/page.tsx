import { prisma } from "@/lib/prisma";
import { UnitsCrud } from "@/components/masters/units-crud";
import { canAccess } from "@/lib/rbac";

export default async function UnitsPage() {
  const [items, canWrite] = await Promise.all([
    prisma.unitOfMeasure.findMany({ orderBy: { name: "asc" } }),
    canAccess("masters:units"),
  ]);
  return <UnitsCrud items={items} canWrite={canWrite} />;
}
