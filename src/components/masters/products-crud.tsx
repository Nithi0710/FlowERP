"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CrudActions, FormModal, PageHeader, FormField, selectClass } from "@/components/crud/crud-ui";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/masters";
import { formatCurrency, calculateFreeQty } from "@/lib/utils";
import { InventoryStatusBadge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  onHandQty: number;
  reservedQty: number;
  reorderLevel: number;
  procurementStrategy: string;
  procurementType: string;
  categoryId?: string | null;
  vendorId?: string | null;
  category?: { name: string } | null;
  vendor?: { name: string } | null;
}

interface ProductsCrudProps {
  products: Product[];
  categories: { id: string; name: string }[];
  vendors: { id: string; name: string }[];
  canWrite: boolean;
}

export function ProductsCrud({ products, categories, vendors, canWrite }: ProductsCrudProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name")),
      sku: String(fd.get("sku")),
      costPrice: parseFloat(String(fd.get("costPrice"))),
      salePrice: parseFloat(String(fd.get("salePrice"))),
      onHandQty: parseFloat(String(fd.get("onHandQty") || "0")),
      reorderLevel: parseFloat(String(fd.get("reorderLevel") || "10")),
      categoryId: String(fd.get("categoryId") || "") || undefined,
      vendorId: String(fd.get("vendorId") || "") || undefined,
      procurementStrategy: String(fd.get("procurementStrategy")) as "MTS" | "MTO",
      procurementType: String(fd.get("procurementType")) as "PURCHASE" | "MANUFACTURING",
    };

    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage product master catalog — add, edit, delete"
        action={
          canWrite ? (
            <Button onClick={() => { setEditing(null); setOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/80 dark:border-gray-800">
                {["Product", "Category", "Cost", "Sale Price", "On Hand", "Free", "Type", "Status", ...(canWrite ? ["Actions"] : [])].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sku}</p>
                  </td>
                  <td className="px-4 py-3">{p.category?.name || "-"}</td>
                  <td className="px-4 py-3">{formatCurrency(p.costPrice)}</td>
                  <td className="px-4 py-3">{formatCurrency(p.salePrice)}</td>
                  <td className="px-4 py-3">{p.onHandQty}</td>
                  <td className="px-4 py-3">{calculateFreeQty(p.onHandQty, p.reservedQty)}</td>
                  <td className="px-4 py-3">{p.procurementType}</td>
                  <td className="px-4 py-3">
                    <InventoryStatusBadge onHand={p.onHandQty} reorderLevel={p.reorderLevel} />
                  </td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <CrudActions
                        onEdit={() => { setEditing(p); setOpen(true); }}
                        onDelete={() => deleteProduct(p.id)}
                        deleteLabel={p.name}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <FormModal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <FormField label="Name"><Input name="name" defaultValue={editing?.name} required className="mt-1" /></FormField>
          <FormField label="SKU"><Input name="sku" defaultValue={editing?.sku} required className="mt-1" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Cost Price"><Input name="costPrice" type="number" step="0.01" defaultValue={editing?.costPrice ?? 0} required className="mt-1" /></FormField>
            <FormField label="Sale Price"><Input name="salePrice" type="number" step="0.01" defaultValue={editing?.salePrice ?? 0} required className="mt-1" /></FormField>
            <FormField label="On Hand"><Input name="onHandQty" type="number" defaultValue={editing?.onHandQty ?? 0} className="mt-1" /></FormField>
            <FormField label="Reorder Level"><Input name="reorderLevel" type="number" defaultValue={editing?.reorderLevel ?? 10} className="mt-1" /></FormField>
          </div>
          <FormField label="Category">
            <select name="categoryId" defaultValue={editing?.categoryId ?? ""} className={selectClass}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Vendor">
            <select name="vendorId" defaultValue={editing?.vendorId ?? ""} className={selectClass}>
              <option value="">None</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Strategy">
              <select name="procurementStrategy" defaultValue={editing?.procurementStrategy ?? "MTO"} className={selectClass}>
                <option value="MTO">MTO</option>
                <option value="MTS">MTS</option>
              </select>
            </FormField>
            <FormField label="Type">
              <select name="procurementType" defaultValue={editing?.procurementType ?? "PURCHASE"} className={selectClass}>
                <option value="PURCHASE">Purchase</option>
                <option value="MANUFACTURING">Manufacturing</option>
              </select>
            </FormField>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : editing ? "Update" : "Create"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
