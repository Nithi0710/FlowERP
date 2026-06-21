import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const workCenters = [
  { name: "Cutting", description: "Cut raw wood", capacity: 100 },
  { name: "Assembly", description: "Join parts", capacity: 50 },
  { name: "Sanding", description: "Smooth surface", capacity: 50 },
  { name: "Painting", description: "Apply polish/paint", capacity: 40 },
  { name: "Upholstery", description: "Add foam/fabric", capacity: 20 },
  { name: "Hardware Fitting", description: "Install handles/hinges", capacity: 30 },
  { name: "Quality Check", description: "Final inspection", capacity: 200 },
];

async function main() {
  for (const wc of workCenters) {
    await prisma.workCenter.upsert({
      where: { name: wc.name },
      update: {},
      create: wc,
    });
  }
  console.log("Work Centres seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
