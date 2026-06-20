import { prisma } from "@/lib/prisma";
import { WorkCentersCrud } from "@/components/masters/work-centers-crud";
import { canAccess } from "@/lib/rbac";

export default async function WorkCentersPage() {
  const [items, canWrite] = await Promise.all([
    prisma.workCenter.findMany({ orderBy: { name: "asc" } }),
    canAccess("masters:work-centers"),
  ]);
  return <WorkCentersCrud items={items} canWrite={canWrite} />;
}
