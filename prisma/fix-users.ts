import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) {
    const res = await prisma.user.updateMany({
      where: { companyId: null },
      data: { companyId: admin.companyId }
    });
    console.log("Fixed users:", res.count);
  }
}

main().finally(() => prisma.$disconnect());
