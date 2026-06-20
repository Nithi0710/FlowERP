import { prisma } from "@/lib/prisma";
import { WarehousesCrud } from "@/components/masters/warehouses-crud";
import { canAccess } from "@/lib/rbac";

export default async function WarehousesPage() {
  const [items, canWrite] = await Promise.all([
    prisma.warehouse.findMany({ orderBy: { name: "asc" } }),
    canAccess("masters:warehouses"),
  ]);
  return <WarehousesCrud items={items} canWrite={canWrite} />;
}
