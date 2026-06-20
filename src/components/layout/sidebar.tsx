"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import { filterNavByRole } from "@/lib/permissions";
import {
  LayoutDashboard,
  Database,
  ShoppingCart,
  Package,
  Factory,
  Boxes,
  BarChart3,
  FileText,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Database,
  ShoppingCart,
  Package,
  Factory,
  Boxes,
  BarChart3,
  FileText,
  Sparkles,
  Settings,
};

interface SidebarProps {
  userRole?: string;
  companyName?: string;
}

function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "FE";
}

export function Sidebar({ userRole = "ADMIN", companyName = "FlowERP" }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(["Masters"]);

  const toggleExpand = (title: string) => {
    setExpanded((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const filteredNav = filterNavByRole((userRole as Role) || "ADMIN");

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6 dark:border-gray-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold text-sm">
          {companyInitials(companyName)}
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            FlowERP
          </h1>
          <p className="text-[10px] text-gray-500 truncate max-w-[140px]" title={companyName}>
            {companyName}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredNav.map((item) => {
          const Icon = iconMap[item.icon || "LayoutDashboard"];
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expanded.includes(item.title);
          const isActive =
            item.href === pathname ||
            item.children?.some((c) => pathname.startsWith(c.href));

          if (hasChildren) {
            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-200 pl-4 dark:border-gray-700">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              pathname === child.href ||
                                pathname.startsWith(child.href + "/")
                                ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            )}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <Link
              key={item.title}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
