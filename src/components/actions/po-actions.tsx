"use client";

import { confirmPurchaseOrder, receivePurchaseOrder } from "@/lib/services/purchase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface POActionsProps {
  orderId: string;
  status: string;
  lines: { id: string; quantity: number; receivedQty: number }[];
}

export function POActions({ orderId, status, lines }: POActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await confirmPurchaseOrder(orderId);
      toast.success("PO confirmed");
      router.refresh();
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  }

  async function handleReceive() {
    setLoading(true);
    try {
      const receipts = lines.filter(l => l.receivedQty < l.quantity).map(l => ({
        lineId: l.id, quantity: l.quantity - l.receivedQty,
      }));
      await receivePurchaseOrder(orderId, receipts);
      toast.success("Goods received — inventory updated");
      router.refresh();
    } catch { toast.error("Failed"); } finally { setLoading(false); }
  }

  return (
    <div className="flex gap-1">
      {status === "DRAFT" && <Button size="sm" onClick={handleConfirm} disabled={loading}>Confirm</Button>}
      {(status === "CONFIRMED" || status === "PARTIALLY_RECEIVED") && (
        <Button size="sm" variant="success" onClick={handleReceive} disabled={loading}>Receive</Button>
      )}
    </div>
  );
}
