"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlowStage {
  id: string;
  label: string;
  status: "RUNNING" | "WAITING" | "DELAYED" | "COMPLETED";
  count?: number;
  detail?: string;
}

const statusColors = {
  RUNNING: "bg-emerald-500 shadow-emerald-500/50",
  WAITING: "bg-amber-500 shadow-amber-500/50",
  DELAYED: "bg-red-500 shadow-red-500/50",
  COMPLETED: "bg-blue-500 shadow-blue-500/50",
};

const statusLabels = {
  RUNNING: "Running",
  WAITING: "Waiting",
  DELAYED: "Delayed",
  COMPLETED: "Completed",
};

interface ControlTowerFlowProps {
  stages: FlowStage[];
}

export function ControlTowerFlow({ stages }: ControlTowerFlowProps) {
  return (
    <div className="relative py-8">
      <div className="flex flex-col items-center gap-0 md:flex-row md:justify-between md:gap-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center md:flex-1">
            <div className="flex flex-col items-center md:flex-row md:w-full">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.15, type: "spring" }}
                className="relative z-10 flex flex-col items-center"
              >
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg",
                    statusColors[stage.status]
                  )}
                >
                  <motion.div
                    animate={
                      stage.status === "RUNNING"
                        ? { scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-center"
                  >
                    <span className="text-lg font-bold">
                      {stage.count ?? ""}
                    </span>
                  </motion.div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {stage.label}
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        statusColors[stage.status]
                      )}
                    />
                    <span className="text-xs text-gray-500">
                      {statusLabels[stage.status]}
                    </span>
                  </div>
                  {stage.detail && (
                    <p className="mt-1 text-xs text-gray-400">{stage.detail}</p>
                  )}
                </div>
              </motion.div>

              {index < stages.length - 1 && (
                <>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
                    className="hidden md:block relative mx-2 h-1 flex-1 origin-left overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                  >
                    <motion.div
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                        delay: index * 0.3,
                      }}
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.15 + 0.3, duration: 0.5 }}
                    className="my-2 h-8 w-0.5 origin-top overflow-hidden bg-gray-200 md:hidden dark:bg-gray-700"
                  >
                    <motion.div
                      animate={{ y: ["-100%", "100%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                      }}
                      className="h-1/3 w-full bg-indigo-500"
                    />
                  </motion.div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
