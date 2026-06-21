"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createDetailedBom } from "@/lib/services/manufacturing";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface WorkCenter {
  id: string;
  name: string;
}

interface BomFormProps {
  products: Product[];
  workCenters: WorkCenter[];
  userId?: string;
}

export function BomForm({ products, workCenters, userId }: BomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [targetProductId, setTargetProductId] = useState("");
  const [components, setComponents] = useState([{ productId: "", quantity: 1 }]);
  const [operations, setOperations] = useState([{ name: "", workCenterId: "", sequence: 1, duration: 60 }]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !targetProductId) {
      toast.error("Please fill in BOM Name and Target Product.");
      return;
    }

    if (components.some(c => !c.productId || c.quantity <= 0)) {
      toast.error("Please fill in all components properly.");
      return;
    }

    if (operations.some(o => !o.name || !o.workCenterId || o.duration <= 0)) {
      toast.error("Please fill in all operations properly.");
      return;
    }

    setLoading(true);
    try {
      await createDetailedBom({
        name,
        productId: targetProductId,
        components,
        operations,
        userId,
      });
      toast.success("Bill of Materials created successfully.");
      router.push("/manufacturing/bom");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create Bill of Materials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>BOM Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">BOM Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Wooden Chair Assembly"
              className="mt-1 max-w-md"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Target Product (Finished Good)</label>
            <select
              value={targetProductId}
              onChange={(e) => setTargetProductId(e.target.value)}
              required
              className="mt-1 flex h-10 w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Raw Materials</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setComponents([...components, { productId: "", quantity: 1 }])}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Material
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {components.map((comp, index) => (
            <div key={index} className="flex items-center gap-4">
              <select
                value={comp.productId}
                onChange={(e) => {
                  const newComps = [...components];
                  newComps[index].productId = e.target.value;
                  setComponents(newComps);
                }}
                required
                className="flex h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">Select raw material...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <Input
                type="number"
                min={0.01}
                step="any"
                value={comp.quantity}
                onChange={(e) => {
                  const newComps = [...components];
                  newComps[index].quantity = Number(e.target.value);
                  setComponents(newComps);
                }}
                className="w-32"
                placeholder="Qty"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setComponents(components.filter((_, i) => i !== index))}
                disabled={components.length === 1}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Work Centres & Operations</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOperations([...operations, { name: "", workCenterId: "", sequence: operations.length + 1, duration: 60 }])}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Operation
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {operations.map((op, index) => (
            <div key={index} className="flex items-center gap-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 shrink-0">
                {index + 1}
              </span>
              <Input
                value={op.name}
                onChange={(e) => {
                  const newOps = [...operations];
                  newOps[index].name = e.target.value;
                  setOperations(newOps);
                }}
                className="flex-1"
                placeholder="Operation Name (e.g., Cut Wood)"
                required
              />
              <select
                value={op.workCenterId}
                onChange={(e) => {
                  const newOps = [...operations];
                  newOps[index].workCenterId = e.target.value;
                  setOperations(newOps);
                }}
                required
                className="flex h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">Select Work Centre...</option>
                {workCenters.map((wc) => (
                  <option key={wc.id} value={wc.id}>{wc.name}</option>
                ))}
              </select>
              <Input
                type="number"
                min={1}
                value={op.duration}
                onChange={(e) => {
                  const newOps = [...operations];
                  newOps[index].duration = Number(e.target.value);
                  setOperations(newOps);
                }}
                className="w-24"
                placeholder="Min"
                title="Duration in minutes"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newOps = operations.filter((_, i) => i !== index);
                  // Update sequences
                  setOperations(newOps.map((o, i) => ({ ...o, sequence: i + 1 })));
                }}
                disabled={operations.length === 1}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save BoM"}
        </Button>
      </div>
    </form>
  );
}
