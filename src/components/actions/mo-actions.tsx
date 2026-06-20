"use client";

import {
  confirmManufacturingOrder,
  startManufacturingOrder,
  completeManufacturingOrder,
} from "@/lib/services/manufacturing";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MOActionsProps {
  orderId: string;
  status: string;
}

export function MOActions({ orderId, status }: MOActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "confirm" | "start" | "complete") {
    setLoading(true);
    try {
      if (action === "confirm") await confirmManufacturingOrder(orderId);
      else if (action === "start") await startManufacturingOrder(orderId);
      else await completeManufacturingOrder(orderId);
      toast.success(`MO ${action}ed successfully`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-1">
      {status === "DRAFT" && (
        <Button size="sm" onClick={() => handleAction("confirm")} disabled={loading}>
          Confirm
        </Button>
      )}
      {status === "CONFIRMED" && (
        <Button size="sm" onClick={() => handleAction("start")} disabled={loading}>
          Start
        </Button>
      )}
      {(status === "IN_PROGRESS" || status === "QUALITY_CHECK") && (
        <Button
          size="sm"
          variant="success"
          onClick={() => handleAction("complete")}
          disabled={loading}
        >
          Complete
        </Button>
      )}
    </div>
  );
}
