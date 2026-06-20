"use client";

import { useState } from "react";
import { ClientDataTable } from "@/components/ui/client-data-table";
import { InventoryStatusBadge } from "@/components/ui/badge";
import { formatCurrency, calculateFreeQty } from "@/lib/utils";
import { ProductDetailsModal } from "./product-details-modal";
import { useRouter } from "next/navigation";

export function ProductTableClient({ products }: { products: any[] }) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <>
      <ClientDataTable
        data={products}
        onRowClick={(item: any) => setSelectedProductId(item.id)}
        columns={[
          { key: "name", header: "Product" },
          { key: "sku", header: "SKU" },
          {
            key: "onHandQty",
            header: "On Hand",
            render: (item) => <span className="font-medium">{String(item.onHandQty)}</span>,
          },
          {
            key: "reservedQty",
            header: "Reserved",
            render: (item) => String(item.reservedQty),
          },
          {
            key: "freeQty",
            header: "Free",
            render: (item) =>
              String(calculateFreeQty(Number(item.onHandQty), Number(item.reservedQty))),
          },
          {
            key: "reorderLevel",
            header: "Reorder Level",
            render: (item) => String(item.reorderLevel),
          },
          {
            key: "costPrice",
            header: "Value",
            render: (item) => formatCurrency(Number(item.onHandQty) * Number(item.costPrice)),
          },
          {
            key: "status",
            header: "Status",
            render: (item) => (
              <InventoryStatusBadge
                onHand={Number(item.onHandQty)}
                reorderLevel={Number(item.reorderLevel)}
              />
            ),
          },
        ]}
      />
      
      <ProductDetailsModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
        onUpdate={() => router.refresh()}
      />
    </>
  );
}
