import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Injecting additional massive data...");

  // 1. Get existing data references
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("Admin not found. Run standard seed first.");
  const companyId = admin.companyId;

  const products = await prisma.product.findMany();
  if (products.length === 0) throw new Error("No products found.");

  const warehouses = await prisma.warehouse.findMany();
  const warehouse = warehouses[0];

  // 2. Add 10 Customers
  console.log("Generating 10 Customers...");
  const customerData = Array.from({ length: 10 }).map((_, i) => ({
    name: `Enterprise Client ${i + 1}`,
    email: `contact${i + 1}@enterprise.com`,
    phone: `+1-555-010${i}`,
    address: `${100 + i} Corporate Blvd, NY`,
  }));
  await prisma.customer.createMany({ data: customerData, skipDuplicates: true });
  const allCustomers = await prisma.customer.findMany();

  // 3. Add 10 Vendors
  console.log("Generating 10 Vendors...");
  const vendorData = Array.from({ length: 10 }).map((_, i) => ({
    name: `Global Supplier ${i + 1}`,
    email: `sales${i + 1}@globalsupply.com`,
    phone: `+1-555-200${i}`,
    address: `${500 + i} Industrial Pkwy, CA`,
  }));
  await prisma.vendor.createMany({ data: vendorData, skipDuplicates: true });
  const allVendors = await prisma.vendor.findMany();

  // 4. Attach line items to dummy Sales Orders
  console.log("Attaching line items to existing Sales Orders...");
  const salesOrders = await prisma.salesOrder.findMany();
  for (const so of salesOrders) {
    const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
    for (let i = 0; i < numItems; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      await prisma.salesOrderLine.create({
        data: {
          salesOrderId: so.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 10) + 1,
          unitPrice: product.salePrice,
        }
      });
    }
  }

  // 5. Attach line items to dummy Purchase Orders
  console.log("Attaching line items to existing Purchase Orders...");
  const purchaseOrders = await prisma.purchaseOrder.findMany();
  for (const po of purchaseOrders) {
    const numItems = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numItems; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      await prisma.purchaseOrderLine.create({
        data: {
          purchaseOrderId: po.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 50) + 10,
          unitPrice: product.costPrice,
        }
      });
    }
  }

  // 6. Create 20 Manufacturing Orders
  console.log("Generating 20 Manufacturing Orders...");
  const boms = await prisma.billOfMaterial.findMany();
  if (boms.length > 0) {
    const moData = Array.from({ length: 20 }).map((_, i) => ({
      orderNumber: `MO-${1000 + i}`,
      productId: boms[i % boms.length].productId,
      bomId: boms[i % boms.length].id,
      quantity: Math.floor(Math.random() * 20) + 5,
      status: ["DRAFT", "CONFIRMED", "IN_PROGRESS"][i % 3] as any,
      createdById: admin.id,
    }));
    await prisma.manufacturingOrder.createMany({ data: moData, skipDuplicates: true });
  }

  // 7. Create Stock Ledger Entries
  console.log("Generating Stock Ledger Entries...");
  if (warehouse) {
    const ledgerData = Array.from({ length: 30 }).map((_, i) => {
      const p = products[i % products.length];
      return {
        productId: p.id,
        quantity: Math.floor(Math.random() * 100) - 20,
        movementType: ["PURCHASE_RECEIPT", "SALES_DELIVERY", "MANUFACTURING_PRODUCE", "ADJUSTMENT"][i % 4] as any,
        reference: `MOV-${1000 + i}`,
        notes: "Automated ledger entry",
      };
    });
    await prisma.stockLedger.createMany({ data: ledgerData });
  }

  // 8. Create Procurement Queue
  console.log("Generating Procurement Queue Items...");
  const queueData = Array.from({ length: 15 }).map((_, i) => {
    const p = products[i % products.length];
    return {
      productId: p.id,
      requiredQty: Math.floor(Math.random() * 500) + 50,
      currentStock: p.onHandQty,
      shortage: Math.floor(Math.random() * 500) + 50,
      suggestedAction: ["PURCHASE", "MANUFACTURING"][i % 2] as any,
      status: ["PENDING", "COMPLETED"][i % 2] as any,
    };
  });
  await prisma.procurementQueue.createMany({ data: queueData });

  // 9. Create Stock Transfers (Using StockLedger with STOCK_TRANSFER type)
  console.log("Generating Stock Transfers...");
  const transferData = Array.from({ length: 10 }).map((_, i) => {
    const p = products[i % products.length];
    return {
      productId: p.id,
      quantity: Math.floor(Math.random() * 50) + 10,
      movementType: "STOCK_TRANSFER" as any,
      reference: `TRF-${1000 + i}`,
      notes: "Inter-warehouse transfer",
    };
  });
  await prisma.stockLedger.createMany({ data: transferData });

  console.log("✅ Massive Data Injection Completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
