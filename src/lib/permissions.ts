import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  SALES_USER: "Sales User",
  PURCHASE_USER: "Purchase User",
  MANUFACTURING_USER: "Manufacturing User",
  INVENTORY_MANAGER: "Inventory Manager",
  BUSINESS_OWNER: "Business Owner",
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ["*"],
  SALES_USER: ["sales", "masters:customers", "masters:products"],
  PURCHASE_USER: ["purchase", "masters:vendors", "masters:products"],
  MANUFACTURING_USER: [
    "manufacturing",
    "masters:products",
    "masters:operations",
    "masters:work-centers",
  ],
  INVENTORY_MANAGER: [
    "inventory",
    "masters:products",
    "masters:warehouses",
    "masters:categories",
    "masters:units",
  ],
  BUSINESS_OWNER: [
    "dashboard",
    "analytics",
    "reports",
    "control-tower",
    "journey",
    "war-room",
    "manufacturing",
    "inventory",
    "sales",
    "purchase",
  ],
};

export function hasPermission(role: Role, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  if (perms.includes("*")) return true;
  return perms.some(
    (p) => p === permission || permission.startsWith(p + ":") || p.startsWith(permission)
  );
}

/** Route prefix → required permission */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  "/masters/users": "masters:users",
  "/masters/products": "masters:products",
  "/masters/categories": "masters:categories",
  "/masters/customers": "masters:customers",
  "/masters/vendors": "masters:vendors",
  "/masters/warehouses": "masters:warehouses",
  "/masters/units": "masters:units",
  "/masters/operations": "masters:operations",
  "/masters/work-centers": "masters:work-centers",
  "/sales": "sales",
  "/purchase": "purchase",
  "/manufacturing": "manufacturing",
  "/inventory": "inventory",
  "/analytics": "analytics",
  "/reports": "reports",
  "/control-tower": "control-tower",
  "/journey": "journey",
  "/war-room": "war-room",
  "/manufacturing-command": "manufacturing",
  "/procurement-center": "inventory",
  "/inventory-health": "inventory",
  "/settings": "settings",
};

export function canRoleAccessRoute(role: Role, path: string): boolean {
  if (role === "ADMIN") return true;
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (path === route || path.startsWith(route + "/")) {
      return hasPermission(role, permission);
    }
  }
  return true;
}

export function filterNavByRole(role: Role) {
  return NAV_ITEMS.map((item) => {
    if (!item.children) {
      if (item.href && !canRoleAccessRoute(role, item.href)) return null;
      if (!item.roles.includes("*") && !item.roles.includes(role) && role !== "ADMIN") {
        return null;
      }
      return item;
    }

    if (!item.roles.includes("*") && !item.roles.includes(role) && role !== "ADMIN") {
      return null;
    }

    const children = item.children.filter((c) => canRoleAccessRoute(role, c.href));
    return children.length ? { ...item, children } : null;
  }).filter(Boolean) as typeof NAV_ITEMS;
}

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["*"],
  },
  {
    title: "Masters",
    icon: "Database",
    roles: ["*"],
    children: [
      { title: "Products", href: "/masters/products", roles: ["*"] },
      { title: "Categories", href: "/masters/categories", roles: ["*"] },
      { title: "Customers", href: "/masters/customers", roles: ["*"] },
      { title: "Vendors", href: "/masters/vendors", roles: ["*"] },
      { title: "Warehouses", href: "/masters/warehouses", roles: ["*"] },
      { title: "Units of Measure", href: "/masters/units", roles: ["*"] },
      { title: "Operations", href: "/masters/operations", roles: ["*"] },
      { title: "Work Centers", href: "/masters/work-centers", roles: ["*"] },
      { title: "Users & Roles", href: "/masters/users", roles: ["ADMIN"] },
    ],
  },
  {
    title: "Sales",
    icon: "ShoppingCart",
    roles: ["ADMIN", "SALES_USER", "BUSINESS_OWNER"],
    children: [
      { title: "Sales Orders", href: "/sales/orders", roles: ["*"] },
      { title: "Deliveries", href: "/sales/deliveries", roles: ["*"] },
    ],
  },
  {
    title: "Purchase",
    icon: "Package",
    roles: ["ADMIN", "PURCHASE_USER", "BUSINESS_OWNER"],
    children: [
      { title: "Purchase Orders", href: "/purchase/orders", roles: ["*"] },
      { title: "Receipts", href: "/purchase/receipts", roles: ["*"] },
    ],
  },
  {
    title: "Manufacturing",
    icon: "Factory",
    roles: ["ADMIN", "MANUFACTURING_USER", "BUSINESS_OWNER"],
    children: [
      { title: "Bill Of Materials", href: "/manufacturing/bom", roles: ["*"] },
      { title: "Manufacturing Orders", href: "/manufacturing/orders", roles: ["*"] },
      { title: "Work Orders", href: "/manufacturing/work-orders", roles: ["*"] },
    ],
  },
  {
    title: "Inventory",
    icon: "Boxes",
    roles: ["ADMIN", "INVENTORY_MANAGER", "BUSINESS_OWNER"],
    children: [
      { title: "Inventory Overview", href: "/inventory", roles: ["*"] },
      { title: "Stock Ledger", href: "/inventory/ledger", roles: ["*"] },
      { title: "Procurement Queue", href: "/inventory/procurement-queue", roles: ["*"] },
      { title: "Stock Transfers", href: "/inventory/transfers", roles: ["*"] },
    ],
  },
  {
    title: "Analytics",
    icon: "BarChart3",
    roles: ["ADMIN", "BUSINESS_OWNER"],
    children: [
      { title: "Business Analytics", href: "/analytics/business", roles: ["*"] },
      { title: "Manufacturing Analytics", href: "/analytics/manufacturing", roles: ["*"] },
      { title: "Inventory Analytics", href: "/analytics/inventory", roles: ["*"] },
    ],
  },
  {
    title: "Reports",
    icon: "FileText",
    roles: ["ADMIN", "BUSINESS_OWNER"],
    children: [
      { title: "Sales Reports", href: "/reports/sales", roles: ["*"] },
      { title: "Purchase Reports", href: "/reports/purchase", roles: ["*"] },
      { title: "Manufacturing Reports", href: "/reports/manufacturing", roles: ["*"] },
      { title: "Inventory Reports", href: "/reports/inventory", roles: ["*"] },
      { title: "Audit Reports", href: "/reports/audit", roles: ["*"] },
    ],
  },
  {
    title: "Special",
    icon: "Sparkles",
    roles: ["ADMIN", "BUSINESS_OWNER"],
    children: [
      { title: "ERP Control Tower", href: "/control-tower", roles: ["*"] },
      { title: "Demand To Delivery", href: "/journey", roles: ["*"] },
      { title: "Executive War Room", href: "/war-room", roles: ["*"] },
      { title: "Manufacturing Command", href: "/manufacturing-command", roles: ["*"] },
      { title: "Procurement Center", href: "/procurement-center", roles: ["*"] },
      { title: "Inventory Health", href: "/inventory-health", roles: ["*"] },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: "Settings",
    roles: ["ADMIN"],
  },
];
