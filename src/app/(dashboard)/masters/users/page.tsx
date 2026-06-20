import { prisma } from "@/lib/prisma";
import { UsersCrud } from "@/components/masters/users-crud";
import { requireAdmin } from "@/lib/rbac";

export default async function UsersPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({
    where: { companyId: admin.companyId ?? undefined },
    orderBy: { createdAt: "desc" },
  });
  return <UsersCrud users={users} />;
}
