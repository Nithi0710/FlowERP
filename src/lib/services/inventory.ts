"use server";

import { prisma } from "@/lib/prisma";
import { MovementType, ProcurementType } from "@prisma/client";
import { generateOrderNumber } from "@/lib/utils";

export async function getProductDetails(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      bomAsFinished: {
        include: {
          components: { include: { product: true } },
          operations: { include: { workCenter: true } }
        }
      },
      manufacturingOrders: {
        where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
        include: { workOrders: { include: { operation: true } } }
      }
    }
  });
}

export async function createAuditLog(data: {
  userId?: string;
  action: string;
  module: string;
  entityId?: string;
  previousValue?: string;
  newValue?: string;
}) {
  return prisma.auditLog.create({ data });
}

export async function addStockLedgerEntry(data: {
  productId: string;
  quantity: number;
  movementType: MovementType;
  reference: string;
  notes?: string;
}) {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });
  if (!product) throw new Error("Product not found");

  const balanceAfter = product.onHandQty + data.quantity;

  return prisma.stockLedger.create({
    data: {
      ...data,
      balanceAfter,
    },
  });
}

export async function reserveStock(productId: string, quantity: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) throw new Error("Product not found");

  const freeQty = product.onHandQty - product.reservedQty;
  const toReserve = Math.min(quantity, freeQty);

  if (toReserve > 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { reservedQty: { increment: toReserve } },
    });

    await addStockLedgerEntry({
      productId,
      quantity: -toReserve,
      movementType: MovementType.RESERVATION,
      reference: "RESERVE",
      notes: `Reserved ${toReserve} units`,
    });
  }

  return { reserved: toReserve, shortage: quantity - toReserve };
}

export async function releaseReservation(productId: string, quantity: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) throw new Error("Product not found");

  const toRelease = Math.min(quantity, product.reservedQty);

  if (toRelease > 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { reservedQty: { decrement: toRelease } },
    });
  }

  return toRelease;
}

export async function consumeStock(
  productId: string,
  quantity: number,
  reference: string,
  movementType: MovementType = MovementType.SALES_DELIVERY
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) throw new Error("Product not found");

  await prisma.product.update({
    where: { id: productId },
    data: {
      onHandQty: { decrement: quantity },
      reservedQty: { decrement: Math.min(quantity, product.reservedQty) },
    },
  });

  await addStockLedgerEntry({
    productId,
    quantity: -quantity,
    movementType,
    reference,
  });
}

export async function addStock(
  productId: string,
  quantity: number,
  reference: string,
  movementType: MovementType = MovementType.PURCHASE_RECEIPT
) {
  await prisma.product.update({
    where: { id: productId },
    data: { onHandQty: { increment: quantity } },
  });

  await addStockLedgerEntry({
    productId,
    quantity,
    movementType,
    reference,
  });
}

export async function triggerProcurementEngine(
  productId: string,
  shortageQty: number,
  salesOrderRef?: string
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { vendor: true },
  });
  if (!product) throw new Error("Product not found");

  await prisma.procurementQueue.create({
    data: {
      productId,
      requiredQty: shortageQty,
      currentStock: product.onHandQty,
      shortage: shortageQty,
      salesOrderRef,
      suggestedAction: product.procurementType,
      status: "PENDING",
    },
  });

  if (product.procurementType === ProcurementType.MANUFACTURING) {
    const bom = await prisma.billOfMaterial.findUnique({
      where: { productId },
      include: { operations: { include: { workCenter: true } } },
    });

    const moCount = await prisma.manufacturingOrder.count();
    const mo = await prisma.manufacturingOrder.create({
      data: {
        orderNumber: generateOrderNumber("MO", moCount),
        productId,
        bomId: bom?.id,
        quantity: shortageQty,
        status: "CONFIRMED",
        salesOrderRef,
      },
    });

    if (bom) {
      for (const op of bom.operations) {
        const woCount = await prisma.workOrder.count();
        await prisma.workOrder.create({
          data: {
            workOrderNumber: generateOrderNumber("WO", woCount),
            manufacturingOrderId: mo.id,
            operationId: op.id,
            workCenterId: op.workCenterId,
            sequence: op.sequence,
            status: "PENDING",
          },
        });
      }

      const components = await prisma.bomComponent.findMany({
        where: { bomId: bom.id },
      });
      for (const comp of components) {
        await reserveStock(comp.productId, comp.quantity * shortageQty);
      }
    }

    if (salesOrderRef) {
      await prisma.journeyEvent.create({
        data: {
          salesOrderId: salesOrderRef,
          manufacturingOrderId: mo.id,
          stage: "MO Generated",
          status: "COMPLETED",
          message: `Manufacturing Order ${mo.orderNumber} created for ${shortageQty} units`,
        },
      });
    }

    return { type: "MO", orderId: mo.id, orderNumber: mo.orderNumber };
  } else {
    if (!product.vendorId) {
      throw new Error("Product has no vendor assigned for purchase");
    }

    const poCount = await prisma.purchaseOrder.count();
    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber: generateOrderNumber("PO", poCount),
        vendorId: product.vendorId,
        status: "CONFIRMED",
        salesOrderRef,
        totalAmount: product.costPrice * shortageQty,
        lines: {
          create: {
            productId,
            quantity: shortageQty,
            unitPrice: product.costPrice,
          },
        },
      },
    });

    if (salesOrderRef) {
      await prisma.journeyEvent.create({
        data: {
          salesOrderId: salesOrderRef,
          stage: "PO Generated",
          status: "COMPLETED",
          message: `Purchase Order ${po.orderNumber} created for ${shortageQty} units`,
        },
      });
    }

    return { type: "PO", orderId: po.id, orderNumber: po.orderNumber };
  }
}

export async function calculateBusinessHealthScore(companyId?: string) {
  const companyFilter = companyId ? { createdBy: { companyId } } : undefined;

  const products = await prisma.product.findMany();
  const salesOrders = await prisma.salesOrder.findMany(companyFilter ? { where: companyFilter } : undefined);
  const manufacturingOrders = await prisma.manufacturingOrder.findMany(companyFilter ? { where: companyFilter } : undefined);
  const procurementQueue = await prisma.procurementQueue.findMany({
    where: { status: "PENDING" },
  });

  let inventoryHealth = 100;
  if (products.length > 0) {
    const healthyCount = products.filter(
      (p) => p.onHandQty > p.reorderLevel
    ).length;
    inventoryHealth = Math.round((healthyCount / products.length) * 100);
  }

  const deliveredOrders = salesOrders.filter(
    (o) => o.status === "DELIVERED"
  ).length;
  const fulfillmentRate =
    salesOrders.length > 0
      ? Math.round((deliveredOrders / salesOrders.length) * 100)
      : 100;

  const completedMOs = manufacturingOrders.filter(
    (o) => o.status === "COMPLETED"
  ).length;
  const manufacturingEfficiency =
    manufacturingOrders.length > 0
      ? Math.round((completedMOs / manufacturingOrders.length) * 100)
      : 100;

  const pendingProcurement = procurementQueue.length;
  const procurementEfficiency = Math.max(
    0,
    100 - pendingProcurement * 10
  );

  const overall = Math.round(
    (inventoryHealth +
      fulfillmentRate +
      manufacturingEfficiency +
      procurementEfficiency) /
      4
  );

  return {
    overall,
    inventoryHealth,
    fulfillmentRate,
    manufacturingEfficiency,
    procurementEfficiency,
  };
}
