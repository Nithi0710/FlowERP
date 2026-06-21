"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createManufacturingOrder, getBomDetails } from "@/lib/services/manufacturing";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ManufacturingOrderFormProps {
  products: { id: string; name: string; sku: string; onHandQty: number }[];
  userId?: string;
}

export function ManufacturingOrderForm({ products, userId }: ManufacturingOrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingBom, setFetchingBom] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [bom, setBom] = useState<any>(null);

  useEffect(() => {
    if (!productId) {
      setBom(null);
      return;
    }

    let isMounted = true;
    setFetchingBom(true);
    getBomDetails(productId)
      .then((data) => {
        if (isMounted) setBom(data);
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) toast.error("Failed to load BoM details");
      })
      .finally(() => {
        if (isMounted) setFetchingBom(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity.");
      return;
    }

    if (!bom) {
      toast.error("Selected product does not have a Bill of Materials. Please create one first.");
      return;
    }

    setLoading(true);
    try {
      await createManufacturingOrder({ productId, quantity, userId });
      toast.success("Manufacturing order created and inventory reserved.");
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
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium">Finished Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className="mt-1 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">Select product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Production Quantity</label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="mt-1 w-full"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading || fetchingBom || !bom}>
                  {loading ? "Processing..." : "Create Work Order"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </div>

            {/* Smart Calculation Panel */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">Smart Calculation</h3>
              
              {!productId ? (
                <p className="text-sm text-gray-500">Select a product to see required materials and work centres.</p>
              ) : fetchingBom ? (
                <p className="text-sm text-gray-500 animate-pulse">Loading BoM details...</p>
              ) : !bom ? (
                <p className="text-sm text-amber-600">No BoM found for this product. Please create one first.</p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Required Materials</h4>
                    <div className="space-y-2">
                      {bom.components.map((comp: any) => {
                        const requiredQty = comp.quantity * quantity;
                        const hasEnough = comp.product.onHandQty >= requiredQty;
                        return (
                          <div key={comp.id} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{comp.product.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                {comp.quantity} × {quantity} = 
                              </span>
                              <Badge variant={hasEnough ? "default" : "destructive"}>
                                {requiredQty}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Assigned Work Centres</h4>
                    <div className="flex flex-wrap gap-2">
                      {bom.operations.map((op: any, i: number) => (
                        <Badge key={op.id} variant="secondary" className="flex items-center gap-1 py-1">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {i + 1}
                          </span>
                          {op.workCenter?.name || "Unknown"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
