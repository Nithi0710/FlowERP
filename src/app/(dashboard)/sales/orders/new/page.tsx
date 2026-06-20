import { prisma } from "@/lib/prisma";
import { SalesOrderForm } from "@/components/forms/sales-order-form";

export default async function NewSalesOrderPage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Sales Order</h1>
        <p className="text-sm text-gray-500">
          Create a customer order — confirming will trigger inventory check & procurement
        </p>
      </div>
      <SalesOrderForm customers={customers} products={products} />
    </div>
  );
}
