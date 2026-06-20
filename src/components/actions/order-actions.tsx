"use client";

import { confirmSalesOrder, deliverSalesOrder } from "@/lib/services/sales";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, Truck } from "lucide-react";

interface OrderActionsProps {
  orderId: string;
  status: string;
  lines: { id: string; quantity: number; deliveredQty: number }[];
}

export function OrderActions({ orderId, status, lines }: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await confirmSalesOrder(orderId);
      toast.success("Order confirmed — stock reserved & procurement triggered");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to confirm");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeliver() {
    setLoading(true);
    try {
      const deliveries = lines
        .filter((l) => l.deliveredQty < l.quantity)
        .map((l) => ({
          lineId: l.id,
          quantity: l.quantity - l.deliveredQty,
        }));
      await deliverSalesOrder(orderId, deliveries);
      toast.success("Delivery completed — stock updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to deliver");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {status === "DRAFT" && (
        <Button onClick={handleConfirm} disabled={loading} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          Confirm Order
        </Button>
      )}
      {(status === "CONFIRMED" || status === "PARTIALLY_DELIVERED") && (
        <Button onClick={handleDeliver} disabled={loading} variant="success" className="gap-2">
          <Truck className="h-4 w-4" />
          Deliver
        </Button>
      )}
    </div>
  );
}
