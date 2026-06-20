import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Not logged in → go to login
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  // Role-based landing pages
  if (role === "SALES_USER") redirect("/sales/orders");
  if (role === "PURCHASE_USER") redirect("/purchase/orders");
  if (role === "MANUFACTURING_USER") redirect("/manufacturing/bom");
  if (role === "INVENTORY_MANAGER") redirect("/inventory");

  // Admin and Business Owner go to main dashboard
  redirect("/dashboard");
}
