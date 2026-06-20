import { prisma } from "@/lib/prisma";
import { CustomersCrud } from "@/components/masters/customers-crud";
import { canAccess } from "@/lib/rbac";

export default async function CustomersPage() {
  const [items, canWrite] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    canAccess("masters:customers"),
  ]);
  return <CustomersCrud items={items} canWrite={canWrite} />;
}
