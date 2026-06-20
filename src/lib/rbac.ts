"use server";

import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { hasPermission } from "./permissions";

export async function getSessionRole(): Promise<Role | null> {
  const session = await getServerSession(authOptions);
  return (session?.user?.role as Role) || null;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function requirePermission(permission: string) {
  const user = await requireAuth();
  const role = user.role as Role;
  if (!role || !hasPermission(role, permission)) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return user;
}

export async function requireAdmin() {
  return requirePermission("masters:users");
}

export async function canAccess(permission: string): Promise<boolean> {
  const role = await getSessionRole();
  if (!role) return false;
  return hasPermission(role, permission);
}
