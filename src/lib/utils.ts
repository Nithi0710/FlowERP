import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateOrderNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

export function getInventoryStatus(
  onHand: number,
  reorderLevel: number
): "healthy" | "low" | "critical" {
  if (onHand <= 0) return "critical";
  if (onHand <= reorderLevel) return "low";
  return "healthy";
}

export function getHealthScoreStatus(score: number): {
  label: string;
  color: string;
} {
  if (score >= 85) return { label: "Excellent", color: "text-emerald-500" };
  if (score >= 70) return { label: "Good", color: "text-blue-500" };
  if (score >= 50) return { label: "Fair", color: "text-amber-500" };
  return { label: "Needs Attention", color: "text-red-500" };
}

export function calculateFreeQty(onHand: number, reserved: number): number {
  return Math.max(0, onHand - reserved);
}
