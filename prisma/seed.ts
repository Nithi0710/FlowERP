import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding FlowERP database...");

  const adminPassword = await bcrypt.hash("admin123", 10);

  const company = await prisma.company.upsert({
    where: { slug: "shiv-furniture-works" },
    update: {},
    create: {
      name: "Shiv Furniture Works",
      slug: "shiv-furniture-works",
      domain: "shivfurniture.com",
      industry: "Furniture Manufacturing",
      address: "123 Industrial Estate, Avinashi Road",
      city: "Coimbatore",
      state: "Tamil Nadu",
      country: "India",
      postalCode: "641014",
      phone: "+91 422 1234567",
      email: "admin@shivfurniture.com",
      website: "https://shivfurniture.com",
      taxId: "33AAAAA0000A1Z5",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@shivfurniture.com" },
    update: { companyId: company.id },
    create: {
      email: "admin@shivfurniture.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      jobTitle: "Managing Director",
      phone: "+91 9876543210",
      companyId: company.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "sales@shivfurniture.com" },
    update: { companyId: company.id },
    create: {
      email: "sales@shivfurniture.com",
      name: "Sales User",
      password: adminPassword,
      role: "SALES_USER",
      jobTitle: "Sales Executive",
      companyId: company.id,
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Furniture" },
      update: {},
      create: { name: "Furniture", description: "Finished furniture products" },
    }),
    prisma.category.upsert({
      where: { name: "Components" },
      update: {},
      create: { name: "Components", description: "Raw materials and parts" },
    }),
    prisma.category.upsert({
      where: { name: "Hardware" },
      update: {},
      create: { name: "Hardware", description: "Screws, bolts, fittings" },
    }),
  ]);

  const unit = await prisma.unitOfMeasure.upsert({
    where: { symbol: "pcs" },
    update: {},
    create: { name: "Pieces", symbol: "pcs" },
  });

  // Use findFirst + upsert-style logic for vendors (no unique field other than name approach)
  const vendorTimber = await prisma.vendor.upsert({
    where: { id: (await prisma.vendor.findFirst({ where: { email: "orders@timbersupplies.com" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      name: "Timber Supplies Co.",
      email: "orders@timbersupplies.com",
      phone: "+91 9876543210",
      address: "Chennai, Tamil Nadu",
    },
  });
  const vendorHardware = await prisma.vendor.upsert({
    where: { id: (await prisma.vendor.findFirst({ where: { email: "sales@hardwaremart.com" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      name: "Hardware Mart",
      email: "sales@hardwaremart.com",
      phone: "+91 9876543211",
      address: "Coimbatore, Tamil Nadu",
    },
  });
  const vendors = [vendorTimber, vendorHardware];

  const customerRoyal = await prisma.customer.upsert({
    where: { id: (await prisma.customer.findFirst({ where: { email: "orders@royalinteriors.com" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      name: "Royal Interiors",
      email: "orders@royalinteriors.com",
      phone: "+91 9123456789",
      address: "Bangalore, Karnataka",
    },
  });
  const customerModern = await prisma.customer.upsert({
    where: { id: (await prisma.customer.findFirst({ where: { email: "purchase@modernliving.com" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      name: "Modern Living Store",
      email: "purchase@modernliving.com",
      phone: "+91 9123456790",
      address: "Hyderabad, Telangana",
    },
  });
  const customerElite = await prisma.customer.upsert({
    where: { id: (await prisma.customer.findFirst({ where: { email: "buy@elitefurnishings.com" } }))?.id ?? "nonexistent" },
    update: {},
    create: {
      name: "Elite Furnishings",
      email: "buy@elitefurnishings.com",
      phone: "+91 9123456791",
      address: "Mumbai, Maharashtra",
    },
  });
  const customers = [customerRoyal, customerModern, customerElite];

  await prisma.warehouse.createMany({
    data: [
      { name: "Main Warehouse", location: "Factory Floor A" },
      { name: "Finished Goods Store", location: "Factory Floor B" },
      { name: "Raw Materials Store", location: "Storage Unit C" },
    ],
    skipDuplicates: true,
  });

  const workCenters = await Promise.all([
    prisma.workCenter.upsert({
      where: { name: "Assembly Line" },
      update: {},
      create: { name: "Assembly Line", description: "Main assembly station", capacity: 10 },
    }),
    prisma.workCenter.upsert({
      where: { name: "Paint Floor" },
      update: {},
      create: { name: "Paint Floor", description: "Painting and finishing", capacity: 8 },
    }),
    prisma.workCenter.upsert({
      where: { name: "Packaging Unit" },
      update: {},
      create: { name: "Packaging Unit", description: "Final packaging", capacity: 15 },
    }),
  ]);

  const tableLegs = await prisma.product.upsert({
    where: { sku: "TL-001" },
    update: {},
    create: {
      name: "Table Legs",
      sku: "TL-001",
      costPrice: 150,
      salePrice: 250,
      onHandQty: 200,
      reorderLevel: 50,
      procurementType: "PURCHASE",
      procurementStrategy: "MTS",
      categoryId: categories[1].id,
      vendorId: vendors[0].id,
      unitId: unit.id,
    },
  });

  const tableTop = await prisma.product.upsert({
    where: { sku: "TT-001" },
    update: {},
    create: {
      name: "Table Top (Wood)",
      sku: "TT-001",
      costPrice: 800,
      salePrice: 1200,
      onHandQty: 50,
      reorderLevel: 10,
      procurementType: "PURCHASE",
      procurementStrategy: "MTS",
      categoryId: categories[1].id,
      vendorId: vendors[0].id,
      unitId: unit.id,
    },
  });

  const screws = await prisma.product.upsert({
    where: { sku: "SCR-001" },
    update: {},
    create: {
      name: "Wood Screws (Pack of 12)",
      sku: "SCR-001",
      costPrice: 25,
      salePrice: 45,
      onHandQty: 500,
      reorderLevel: 100,
      procurementType: "PURCHASE",
      procurementStrategy: "MTS",
      categoryId: categories[2].id,
      vendorId: vendors[1].id,
      unitId: unit.id,
    },
  });

  const woodenTable = await prisma.product.upsert({
    where: { sku: "WT-001" },
    update: {},
    create: {
      name: "Wooden Table",
      sku: "WT-001",
      costPrice: 2500,
      salePrice: 4500,
      onHandQty: 5,
      reorderLevel: 10,
      procurementType: "MANUFACTURING",
      procurementStrategy: "MTO",
      categoryId: categories[0].id,
      unitId: unit.id,
    },
  });

  const diningChair = await prisma.product.upsert({
    where: { sku: "DC-001" },
    update: {},
    create: {
      name: "Dining Chair",
      sku: "DC-001",
      costPrice: 1200,
      salePrice: 2200,
      onHandQty: 15,
      reorderLevel: 5,
      procurementType: "MANUFACTURING",
      procurementStrategy: "MTO",
      categoryId: categories[0].id,
      unitId: unit.id,
    },
  });

  const chairLegs = await prisma.product.upsert({
    where: { sku: "CL-001" },
    update: {},
    create: {
      name: "Chair Legs",
      sku: "CL-001",
      costPrice: 80,
      salePrice: 150,
      onHandQty: 100,
      reorderLevel: 30,
      procurementType: "PURCHASE",
      procurementStrategy: "MTS",
      categoryId: categories[1].id,
      vendorId: vendors[0].id,
      unitId: unit.id,
    },
  });

  const chairSeat = await prisma.product.upsert({
    where: { sku: "CS-001" },
    update: {},
    create: {
      name: "Chair Seat Cushion",
      sku: "CS-001",
      costPrice: 300,
      salePrice: 500,
      onHandQty: 40,
      reorderLevel: 10,
      procurementType: "PURCHASE",
      procurementStrategy: "MTS",
      categoryId: categories[1].id,
      vendorId: vendors[0].id,
      unitId: unit.id,
    },
  });

  const tableBom = await prisma.billOfMaterial.upsert({
    where: { productId: woodenTable.id },
    update: {},
    create: {
      name: "Wooden Table BOM",
      productId: woodenTable.id,
      components: {
        create: [
          { productId: tableLegs.id, quantity: 4 },
          { productId: tableTop.id, quantity: 1 },
          { productId: screws.id, quantity: 1 },
        ],
      },
      operations: {
        create: [
          { name: "Assembly", sequence: 1, duration: 120, workCenterId: workCenters[0].id },
          { name: "Painting", sequence: 2, duration: 90, workCenterId: workCenters[1].id },
          { name: "Packing", sequence: 3, duration: 30, workCenterId: workCenters[2].id },
        ],
      },
    },
  });

  await prisma.billOfMaterial.upsert({
    where: { productId: diningChair.id },
    update: {},
    create: {
      name: "Dining Chair BOM",
      productId: diningChair.id,
      components: {
        create: [
          { productId: chairLegs.id, quantity: 4 },
          { productId: chairSeat.id, quantity: 1 },
          { productId: screws.id, quantity: 1 },
        ],
      },
      operations: {
        create: [
          { name: "Assembly", sequence: 1, duration: 60, workCenterId: workCenters[0].id },
          { name: "Painting", sequence: 2, duration: 45, workCenterId: workCenters[1].id },
          { name: "Packing", sequence: 3, duration: 15, workCenterId: workCenters[2].id },
        ],
      },
    },
  });

  console.log("Generating 150 Sales Orders...");
  const salesOrderData = Array.from({ length: 150 }).map((_, i) => ({
    orderNumber: `SO-${2000 + i}`,
    customerId: customers[i % customers.length].id,
    status: ["DRAFT", "CONFIRMED", "DELIVERED"][i % 3] as any,
    totalAmount: Math.floor(Math.random() * 50000) + 1000,
    createdById: admin.id,
  }));
  await prisma.salesOrder.createMany({ data: salesOrderData, skipDuplicates: true });

  console.log("Generating 150 Purchase Orders...");
  const purchaseOrderData = Array.from({ length: 150 }).map((_, i) => ({
    orderNumber: `PO-${2000 + i}`,
    vendorId: vendors[i % vendors.length].id,
    status: ["DRAFT", "CONFIRMED", "RECEIVED"][i % 3] as any,
    totalAmount: Math.floor(Math.random() * 20000) + 500,
    createdById: admin.id,
  }));
  await prisma.purchaseOrder.createMany({ data: purchaseOrderData, skipDuplicates: true });

  console.log("✅ Seed completed!");
  console.log(`   Admin: admin@shivfurniture.com / admin123`);
  console.log(`   Products: 7 | Customers: 3 | Vendors: 2`);
  console.log(`   BOMs: 2 (Wooden Table, Dining Chair)`);
  console.log(`   Orders: 150 Sales | 150 Purchase`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
