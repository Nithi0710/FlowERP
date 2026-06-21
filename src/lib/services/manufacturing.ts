"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateOrderNumber } from "@/lib/utils";
import {
  addStock,
  consumeStock,
  createAuditLog,
  reserveStock,
} from "./inventory";
import { MovementType } from "@prisma/client";

export async function confirmManufacturingOrder(
  orderId: string,
  userId?: string
) {
  const mo = await prisma.manufacturingOrder.findUnique({
    where: { id: orderId },
    include: {
      bom: { include: { components: true, operations: true } },
    },
  });
  if (!mo) throw new Error("MO not found");
  if (!mo.bom) throw new Error("No BOM assigned");

  for (const comp of mo.bom.components) {
    await reserveStock(comp.productId, comp.quantity * mo.quantity);
  }

  for (const op of mo.bom.operations) {
    const woCount = await prisma.workOrder.count();
    await prisma.workOrder.create({
      data: {
        workOrderNumber: generateOrderNumber("WO", woCount),
        manufacturingOrderId: orderId,
        operationId: op.id,
        workCenterId: op.workCenterId,
        sequence: op.sequence,
        status: "PENDING",
      },
    });
  }

  await prisma.manufacturingOrder.update({
    where: { id: orderId },
    data: { status: "CONFIRMED" },
  });

  await prisma.journeyEvent.create({
    data: {
      manufacturingOrderId: orderId,
      stage: "Components Reserved",
      status: "COMPLETED",
      message: "All components reserved for production",
    },
  });

  await createAuditLog({
    userId,
    action: "CONFIRM",
    module: "Manufacturing",
    entityId: orderId,
    newValue: "CONFIRMED",
  });

  revalidatePath("/manufacturing/orders");
  return { success: true };
}

export async function startManufacturingOrder(orderId: string, userId?: string) {
  await prisma.manufacturingOrder.update({
    where: { id: orderId },
    data: { status: "IN_PROGRESS", startDate: new Date() },
  });

  await prisma.journeyEvent.create({
    data: {
      manufacturingOrderId: orderId,
      stage: "Production Started",
      status: "RUNNING",
      message: "Manufacturing in progress",
    },
  });

  await createAuditLog({
    userId,
    action: "START",
    module: "Manufacturing",
    entityId: orderId,
    newValue: "IN_PROGRESS",
  });

  revalidatePath("/manufacturing/orders");
  revalidatePath("/control-tower");
  return { success: true };
}

export async function completeManufacturingOrder(
  orderId: string,
  userId?: string
) {
  const mo = await prisma.manufacturingOrder.findUnique({
    where: { id: orderId },
    include: {
      bom: { include: { components: true } },
      product: true,
    },
  });
  if (!mo || !mo.bom) throw new Error("MO or BOM not found");

  for (const comp of mo.bom.components) {
    await consumeStock(
      comp.productId,
      comp.quantity * mo.quantity,
      mo.orderNumber,
      MovementType.MANUFACTURING_CONSUME
    );
  }

  await addStock(
    mo.productId,
    mo.quantity,
    mo.orderNumber,
    MovementType.MANUFACTURING_PRODUCE
  );

  await prisma.manufacturingOrder.update({
    where: { id: orderId },
    data: { status: "COMPLETED", endDate: new Date() },
  });

  await prisma.workOrder.updateMany({
    where: { manufacturingOrderId: orderId },
    data: { status: "COMPLETED", endDate: new Date() },
  });

  await prisma.journeyEvent.create({
    data: {
      manufacturingOrderId: orderId,
      stage: "Finished Goods Produced",
      status: "COMPLETED",
      message: `${mo.quantity} units of ${mo.product.name} produced`,
    },
  });

  await prisma.journeyEvent.create({
    data: {
      manufacturingOrderId: orderId,
      stage: "Inventory Updated",
      status: "COMPLETED",
      message: "Inventory updated with finished goods",
    },
  });

  await createAuditLog({
    userId,
    action: "COMPLETE",
    module: "Manufacturing",
    entityId: orderId,
    newValue: "COMPLETED",
  });

  revalidatePath("/manufacturing/orders");
  revalidatePath("/inventory");
  revalidatePath("/control-tower");
  return { success: true };
}

export async function updateWorkOrderStatus(
  workOrderId: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  userId?: string
) {
  const data: { status: typeof status; startDate?: Date; endDate?: Date } = {
    status,
  };
  if (status === "IN_PROGRESS") data.startDate = new Date();
  if (status === "COMPLETED") data.endDate = new Date();

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data,
  });

  await createAuditLog({
    userId,
    action: "UPDATE_STATUS",
    module: "WorkOrder",
    entityId: workOrderId,
    newValue: status,
  });

  revalidatePath("/manufacturing/work-orders");
  return { success: true };
}

export async function createManufacturingOrder(data: {
  productId: string;
  quantity: number;
  userId?: string;
}) {
  const bom = await prisma.billOfMaterial.findUnique({
    where: { productId: data.productId },
  });

  const count = await prisma.manufacturingOrder.count();
  const mo = await prisma.manufacturingOrder.create({
    data: {
      orderNumber: generateOrderNumber("MO", count),
      productId: data.productId,
      bomId: bom?.id,
      quantity: data.quantity,
      createdById: data.userId,
    },
    include: { product: true },
  });

  await createAuditLog({
    userId: data.userId,
    action: "CREATE",
    module: "Manufacturing",
    entityId: mo.id,
    newValue: mo.orderNumber,
  });

  // Automatically confirm the order to reserve stock and generate Work Orders
  await confirmManufacturingOrder(mo.id, data.userId);

  revalidatePath("/manufacturing/orders");
  return mo;
}

export async function createDetailedBom(data: {
  name: string;
  productId: string;
  components: { productId: string; quantity: number }[];
  operations: { name: string; workCenterId: string; sequence: number; duration: number }[];
  userId?: string;
}) {
  const bom = await prisma.billOfMaterial.create({
    data: {
      name: data.name,
      productId: data.productId,
      components: {
        create: data.components.map(c => ({
          productId: c.productId,
          quantity: c.quantity,
        })),
      },
      operations: {
        create: data.operations.map(o => ({
          name: o.name,
          workCenterId: o.workCenterId,
          sequence: o.sequence,
          duration: o.duration,
        })),
      },
    },
  });

  await createAuditLog({
    userId: data.userId,
    action: "CREATE",
    module: "BoM",
    entityId: bom.id,
    newValue: bom.name,
  });

  revalidatePath("/manufacturing/bom");
  return bom;
}

export async function getBomDetails(productId: string) {
  const bom = await prisma.billOfMaterial.findUnique({
    where: { productId },
    include: {
      components: {
        include: { product: true },
      },
      operations: {
        include: { workCenter: true },
        orderBy: { sequence: "asc" },
      },
    },
  });
  return bom;
}
