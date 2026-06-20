"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createSalesOrder } from "@/lib/services/sales";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface SalesOrderFormProps {
  customers: { id: string; name: string }[];
  products: { id: string; name: string; sku: string; salePrice: number; onHandQty: number }[];
}

interface LineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export function SalesOrderForm({ customers, products }: SalesOrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { productId: "", quantity: 1, unitPrice: 0 },
  ]);

  const addLine = () => {
    setLines([...lines, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...lines];
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      updated[index] = {
        ...updated[index],
        productId: value as string,
        unitPrice: product?.salePrice || 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setLines(updated);
  };

  const total = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || lines.some((l) => !l.productId)) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await createSalesOrder({
        customerId,
        lines: lines.filter((l) => l.productId),
      });
      toast.success("Sales order created");
      router.push("/sales/orders");
    } catch {
      toast.error("Failed to create order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Sales Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="mt-1 flex h-10 w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Order Lines</label>
              <Button type="button" variant="outline" size="sm" onClick={addLine}>
                <Plus className="h-4 w-4 mr-1" /> Add Line
              </Button>
            </div>
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <select
                      value={line.productId}
                      onChange={(e) => updateLine(index, "productId", e.target.value)}
                      required
                      className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) — Stock: {p.onHandQty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    type="number"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, "quantity", parseFloat(e.target.value))}
                    className="w-24"
                    min={1}
                  />
                  <Input
                    type="number"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(index, "unitPrice", parseFloat(e.target.value))}
                    className="w-32"
                    step="0.01"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(index)}
                    disabled={lines.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-lg font-bold">
              Total: ₹{total.toLocaleString("en-IN")}
            </p>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Order"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
