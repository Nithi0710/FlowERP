import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireRole(roles: Role[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const userRole = (user as { role?: Role }).role;
  if (!userRole || !roles.includes(userRole)) {
    throw new Error("Forbidden");
  }
  return user;
}
