import { prisma } from "@/lib/prisma";
import { CategoriesCrud } from "@/components/masters/categories-crud";
import { canAccess } from "@/lib/rbac";

export default async function CategoriesPage() {
  const [items, canWrite] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    canAccess("masters:categories"),
  ]);
  return <CategoriesCrud items={items} canWrite={canWrite} />;
}
