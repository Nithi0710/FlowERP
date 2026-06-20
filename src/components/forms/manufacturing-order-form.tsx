"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createManufacturingOrder } from "@/lib/services/manufacturing";
import { toast } from "sonner";

interface ManufacturingOrderFormProps {
  products: { id: string; name: string; sku: string; onHandQty: number }[];
  userId?: string;
}

export function ManufacturingOrderForm({ products, userId }: ManufacturingOrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity.");
      return;
    }

    setLoading(true);
    try {
      await createManufacturingOrder({ productId, quantity, userId });
      toast.success("Manufacturing order created.");
      router.push("/manufacturing/orders");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create manufacturing order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Manufacturing Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium">Finished Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="mt-1 flex h-10 w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) — Stock: {product.onHandQty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Quantity</label>
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="mt-1 w-40"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create MO"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
