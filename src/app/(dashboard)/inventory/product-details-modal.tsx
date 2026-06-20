"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getProductDetails, reserveStock } from "@/lib/services/inventory";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Package, Factory, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductDetailsModalProps {
  productId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProductDetailsModal({ productId, onClose, onUpdate }: ProductDetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    getProductDetails(productId)
      .then(setDetails)
      .catch((e) => toast.error("Failed to load details"))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleReserve = async () => {
    if (!productId) return;
    setReserving(true);
    try {
      const res = await reserveStock(productId, 1);
      toast.success(`Reserved ${res.reserved} unit(s)`);
      if (res.shortage > 0) toast.warning(`Shortage of ${res.shortage} units`);
      onUpdate();
      // Reload details
      const newDetails = await getProductDetails(productId);
      setDetails(newDetails);
    } catch (e: any) {
      toast.error(e.message || "Failed to reserve stock");
    } finally {
      setReserving(false);
    }
  };

  return (
    <Dialog open={!!productId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl">
              {details?.name || "Loading..."}
              {details?.sku && <Badge className="ml-2 bg-indigo-100 text-indigo-700">{details.sku}</Badge>}
            </span>
            <Button size="sm" onClick={handleReserve} disabled={reserving || !details}>
              {reserving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Reserve 1 Unit
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : !details ? (
          <p className="text-gray-500 py-8 text-center">No details found</p>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 uppercase">On Hand</p>
                <p className="text-lg font-semibold">{details.onHandQty}</p>
              </div>
              <div className="rounded-lg border p-3 bg-indigo-50 dark:bg-indigo-900/20">
                <p className="text-xs text-indigo-500 uppercase">Reserved</p>
                <p className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">{details.reservedQty}</p>
              </div>
              <div className="rounded-lg border p-3 bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-xs text-emerald-500 uppercase">Free Qty</p>
                <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                  {Math.max(0, details.onHandQty - details.reservedQty)}
                </p>
              </div>
            </div>

            {/* Bill of Materials (BOM) & Active Components (AC) */}
            {details.bomAsFinished ? (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-500" />
                  Bill of Materials & Active Components (AC)
                </h3>
                <div className="rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Component</th>
                        <th className="px-4 py-2 text-left font-medium">Qty Req</th>
                        <th className="px-4 py-2 text-left font-medium">Current Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {details.bomAsFinished.components.map((comp: any) => (
                        <tr key={comp.id}>
                          <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{comp.product.name}</td>
                          <td className="px-4 py-2">{comp.quantity}</td>
                          <td className="px-4 py-2">
                            <span className={comp.product.onHandQty < comp.quantity ? "text-red-500 font-medium" : "text-emerald-500"}>
                              {comp.product.onHandQty}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No Bill of Materials (Purchased Product)</p>
            )}

            {/* Work Orders (WO) */}
            {details.manufacturingOrders?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Factory className="h-4 w-4 text-amber-500" />
                  Active Work Orders (WO)
                </h3>
                <div className="rounded-lg border divide-y">
                  {details.manufacturingOrders.map((mo: any) => (
                    <div key={mo.id} className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">MO: {mo.orderNumber} (Qty: {mo.quantity})</span>
                        <Badge variant="outline">{mo.status}</Badge>
                      </div>
                      <div className="ml-4 space-y-2 border-l-2 border-gray-100 dark:border-gray-800 pl-3">
                        {mo.workOrders.map((wo: any) => (
                          <div key={wo.id} className="flex justify-between text-xs items-center">
                            <span className="text-gray-600 dark:text-gray-400">
                              WO: {wo.workOrderNumber} - {wo.operation?.name}
                            </span>
                            <Badge className="bg-gray-100 text-gray-600 border-none">{wo.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
