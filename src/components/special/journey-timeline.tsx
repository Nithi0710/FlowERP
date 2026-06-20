"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";

interface JourneyStep {
  id: string;
  stage: string;
  status: "COMPLETED" | "RUNNING" | "WAITING" | "DELAYED";
  message?: string;
  timestamp?: string;
}

const statusIcons = {
  COMPLETED: CheckCircle2,
  RUNNING: Loader2,
  WAITING: Circle,
  DELAYED: AlertCircle,
};

const statusColors = {
  COMPLETED: "text-emerald-500 border-emerald-500",
  RUNNING: "text-indigo-500 border-indigo-500",
  WAITING: "text-gray-400 border-gray-300",
  DELAYED: "text-red-500 border-red-500",
};

interface JourneyTimelineProps {
  steps: JourneyStep[];
}

export function JourneyTimeline({ steps }: JourneyTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = statusIcons[step.status];
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-start gap-4 pl-2"
            >
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white dark:bg-gray-900",
                  statusColors[step.status]
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    step.status === "RUNNING" && "animate-spin"
                  )}
                />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {step.stage}
                  </h4>
                  {step.timestamp && (
                    <span className="text-xs text-gray-400">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                {step.message && (
                  <p className="mt-1 text-sm text-gray-500">{step.message}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
