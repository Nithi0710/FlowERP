"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createProduct } from "@/lib/actions/masters";
import { toast } from "sonner";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
}

export function ProductForm({ categories, vendors }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      await createProduct({
        name: form.get("name") as string,
        sku: form.get("sku") as string,
        costPrice: parseFloat(form.get("costPrice") as string),
        salePrice: parseFloat(form.get("salePrice") as string),
        categoryId: (form.get("categoryId") as string) || undefined,
        vendorId: (form.get("vendorId") as string) || undefined,
        procurementStrategy: form.get("procurementStrategy") as "MTS" | "MTO",
        procurementType: form.get("procurementType") as "PURCHASE" | "MANUFACTURING",
        reorderLevel: parseFloat(form.get("reorderLevel") as string) || 10,
        onHandQty: parseFloat(form.get("onHandQty") as string) || 0,
      });
      toast.success("Product created");
      router.push("/masters/products");
    } catch {
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="text-sm font-medium">Product Name</label>
            <Input name="name" required className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">SKU</label>
            <Input name="sku" required className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cost Price</label>
              <Input name="costPrice" type="number" step="0.01" required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Sale Price</label>
              <Input name="salePrice" type="number" step="0.01" required className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">On Hand Qty</label>
              <Input name="onHandQty" type="number" defaultValue="0" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Reorder Level</label>
              <Input name="reorderLevel" type="number" defaultValue="10" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select name="categoryId" className="mt-1 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Vendor</label>
            <select name="vendorId" className="mt-1 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Procurement Strategy</label>
              <select name="procurementStrategy" className="mt-1 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                <option value="MTO">Make To Order (MTO)</option>
                <option value="MTS">Make To Stock (MTS)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Procurement Type</label>
              <select name="procurementType" className="mt-1 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                <option value="MANUFACTURING">Manufacturing</option>
                <option value="PURCHASE">Purchase</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
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
