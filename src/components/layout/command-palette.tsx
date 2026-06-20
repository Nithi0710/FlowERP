"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useEffect } from "react";

const pages = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Notifications", href: "/notifications" },
  { name: "Profile", href: "/profile" },
  { name: "Products", href: "/masters/products" },
  { name: "Customers", href: "/masters/customers" },
  { name: "Sales Orders", href: "/sales/orders" },
  { name: "Purchase Orders", href: "/purchase/orders" },
  { name: "Manufacturing Orders", href: "/manufacturing/orders" },
  { name: "Inventory Overview", href: "/inventory" },
  { name: "Stock Ledger", href: "/inventory/ledger" },
  { name: "ERP Control Tower", href: "/control-tower" },
  { name: "Demand To Delivery", href: "/journey" },
  { name: "Executive War Room", href: "/war-room" },
  { name: "Business Analytics", href: "/analytics/business" },
  { name: "Bill of Materials", href: "/manufacturing/bom" },
  { name: "Work Orders", href: "/manufacturing/work-orders" },
  { name: "Procurement Queue", href: "/inventory/procurement-queue" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <Command className="rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-700">
            <Search className="h-4 w-4 text-gray-400" />
            <Command.Input
              placeholder="Search pages, actions..."
              className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-gray-500">
              No results found.
            </Command.Empty>
            <Command.Group heading="Pages" className="text-xs text-gray-500 px-2 py-1">
              {pages.map((page) => (
                <Command.Item
                  key={page.href}
                  value={page.name}
                  onSelect={() => {
                    router.push(page.href);
                    onOpenChange(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm aria-selected:bg-indigo-50 aria-selected:text-indigo-700 dark:aria-selected:bg-indigo-900/30 dark:aria-selected:text-indigo-300"
                >
                  {page.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
