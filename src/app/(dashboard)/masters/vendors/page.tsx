import { prisma } from "@/lib/prisma";
import { VendorsCrud } from "@/components/masters/vendors-crud";
import { canAccess } from "@/lib/rbac";

export default async function VendorsPage() {
  const [items, canWrite] = await Promise.all([
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
    canAccess("masters:vendors"),
  ]);
  return <VendorsCrud items={items} canWrite={canWrite} />;
}
