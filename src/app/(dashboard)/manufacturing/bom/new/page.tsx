import { prisma } from "@/lib/prisma";
import { BomForm } from "@/components/forms/bom-form";
import { requireAuth } from "@/lib/rbac";

export default async function NewBomPage() {
  const user = await requireAuth();
  
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const workCenters = await prisma.workCenter.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Bill of Materials</h1>
        <p className="text-sm text-gray-500">
          Define the components and work centre operations required to manufacture a finished product.
        </p>
      </div>
      <BomForm products={products} workCenters={workCenters} userId={user.id} />
    </div>
  );
}
