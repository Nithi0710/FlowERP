"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
  delay?: number;
}

export function KPICard({
  title,
  value,
  prefix = "",
  suffix = "",
  icon,
  trend,
  color = "text-indigo-600",
  delay = 0,
}: KPICardProps) {
  const spring = useSpring(0, { duration: 2000 });
  const display = useTransform(spring, (v) =>
    Math.round(v).toLocaleString("en-IN")
  );
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    spring.set(value);
    const unsub = display.on("change", (v) => setDisplayValue(v));
    return unsub;
  }, [value, spring, display]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`mt-2 text-3xl font-bold ${color}`}>
            {prefix}
            {displayValue}
            {suffix}
          </p>
          {trend && (
            <p
              className={`mt-1 text-xs ${
                trend.value >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={`rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/30 ${color}`}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function HealthScoreRing({
  score,
  size = 120,
}: {
  score: number;
  size?: number;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 85) return "#10b981";
    if (score >= 70) return "#3b82f6";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.span
          className="text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="block text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}
