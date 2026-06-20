import { prisma } from "@/lib/prisma";
import { ProductsCrud } from "@/components/masters/products-crud";
import { canAccess } from "@/lib/rbac";

export default async function ProductsPage() {
  const [products, categories, vendors, canWrite] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, vendor: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
    canAccess("masters:products"),
  ]);

  return (
    <ProductsCrud
      products={products}
      categories={categories}
      vendors={vendors}
      canWrite={canWrite}
    />
  );
}
