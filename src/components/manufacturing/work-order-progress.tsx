"use client";

import { useState } from "react";
import { updateWorkOrderStatus } from "@/lib/services/manufacturing";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  sequence: number;
  operation?: { name: string } | null;
  workCenter?: { name: string } | null;
}

export function WorkOrderProgress({ workOrders }: { workOrders: WorkOrder[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Sort by sequence
  const sortedOrders = [...workOrders].sort((a, b) => a.sequence - b.sequence);

  async function handleStatusToggle(wo: WorkOrder) {
    if (wo.status === "COMPLETED") return; // Already completed
    
    setLoadingId(wo.id);
    try {
      const nextStatus = wo.status === "PENDING" ? "IN_PROGRESS" : "COMPLETED";
      await updateWorkOrderStatus(wo.id, nextStatus);
      toast.success(`Operation marked as ${nextStatus.replace("_", " ")}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-2 mt-4">
      {sortedOrders.map((wo) => {
        const isCompleted = wo.status === "COMPLETED";
        const isInProgress = wo.status === "IN_PROGRESS";
        
        return (
          <div
            key={wo.id}
            onClick={() => handleStatusToggle(wo)}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              isCompleted
                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                : isInProgress
                ? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
            } ${loadingId === wo.id ? "opacity-50 pointer-events-none" : ""} ${!isCompleted ? "cursor-pointer" : "cursor-default"}`}
          >
            <div className="flex flex-col">
              <span className={`font-medium ${isCompleted ? "text-green-700 dark:text-green-400 line-through opacity-70" : isInProgress ? "text-amber-700 dark:text-amber-400" : ""}`}>
                {wo.operation?.name || wo.workCenter?.name || "Operation"}
              </span>
              <span className="text-xs text-gray-500">{wo.workOrderNumber}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-medium">
              {isCompleted ? (
                <>
                  <span className="text-green-600 dark:text-green-400">Completed</span>
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </>
              ) : isInProgress ? (
                <>
                  <span className="text-amber-600 dark:text-amber-400">In Progress</span>
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </>
              ) : (
                <>
                  <span className="text-gray-500">Pending</span>
                  <Circle className="h-5 w-5 text-gray-400" />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
