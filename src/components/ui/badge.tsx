import { cn } from "@/lib/utils";

const badgeVariants: Record<string, string> = {
  default: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  secondary: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  outline: "border border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { variant: keyof typeof badgeVariants; label: string }> = {
    DRAFT: { variant: "secondary", label: "Draft" },
    CONFIRMED: { variant: "default", label: "Confirmed" },
    IN_PROGRESS: { variant: "warning", label: "In Progress" },
    PARTIALLY_DELIVERED: { variant: "warning", label: "Partial Delivery" },
    DELIVERED: { variant: "success", label: "Delivered" },
    PARTIALLY_RECEIVED: { variant: "warning", label: "Partial Receipt" },
    RECEIVED: { variant: "success", label: "Received" },
    QUALITY_CHECK: { variant: "warning", label: "Quality Check" },
    COMPLETED: { variant: "success", label: "Completed" },
    PENDING: { variant: "secondary", label: "Pending" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
    RUNNING: { variant: "success", label: "Running" },
    WAITING: { variant: "warning", label: "Waiting" },
    DELAYED: { variant: "destructive", label: "Delayed" },
  };

  const config = statusMap[status] || { variant: "secondary" as const, label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function InventoryStatusBadge({
  onHand,
  reorderLevel,
}: {
  onHand: number;
  reorderLevel: number;
}) {
  if (onHand <= 0)
    return <Badge variant="destructive">Critical</Badge>;
  if (onHand <= reorderLevel)
    return <Badge variant="warning">Low Stock</Badge>;
  return <Badge variant="success">Healthy</Badge>;
}
