"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { FormModal, FormField, selectClass } from "@/components/crud/crud-ui";

export function BomCrud({ products }: { products: any[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name"));
    const productId = String(fd.get("productId"));

    try {
      const res = await fetch("/api/bom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, productId }),
      });
      if (!res.ok) throw new Error("Failed to create BOM");
      toast.success("Bill of Materials created successfully");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" /> Create BOM
      </Button>

      <FormModal open={open} onClose={() => setOpen(false)} title="Create Bill of Materials">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="BOM Name">
            <Input name="name" required placeholder="e.g. Standard Assembly" className="mt-1" />
          </FormField>
          
          <FormField label="Target Product (Finished Good)">
            <select name="productId" required className={selectClass}>
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </FormField>
          
          <div className="bg-amber-50 text-amber-800 p-3 rounded text-sm border border-amber-200">
            Note: Component and operation mapping must be configured in the detailed view after creation.
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </FormModal>
    </>
  );
}
