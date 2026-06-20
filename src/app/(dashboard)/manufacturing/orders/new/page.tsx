import { prisma } from "@/lib/prisma";
import { ManufacturingOrderForm } from "@/components/forms/manufacturing-order-form";
import { requireAuth } from "@/lib/rbac";

export default async function NewManufacturingOrderPage() {
  const user = await requireAuth();
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Manufacturing Order</h1>
        <p className="text-sm text-gray-500">
          Create a production order for a finished product and reserve the required components.
        </p>
      </div>
      <ManufacturingOrderForm products={products} userId={user.id} />
    </div>
  );
}
