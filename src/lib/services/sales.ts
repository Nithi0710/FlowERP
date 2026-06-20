"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateOrderNumber } from "@/lib/utils";
import {
  reserveStock,
  triggerProcurementEngine,
  consumeStock,
  createAuditLog,
} from "./inventory";
import { MovementType } from "@prisma/client";

export async function confirmSalesOrder(orderId: string, userId?: string) {
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: { lines: { include: { product: true } } },
  });
  if (!order) throw new Error("Order not found");
  if (order.status !== "DRAFT") throw new Error("Order is not in draft status");

  for (const line of order.lines) {
    const { reserved, shortage } = await reserveStock(
      line.productId,
      line.quantity
    );

    await prisma.journeyEvent.create({
      data: {
        salesOrderId: orderId,
        stage: "Stock Checked",
        status: shortage > 0 ? "DELAYED" : "COMPLETED",
        message: `Reserved ${reserved} of ${line.quantity} for ${line.product.name}${
          shortage > 0 ? `, shortage: ${shortage}` : ""
        }`,
      },
    });

    if (shortage > 0) {
      await prisma.journeyEvent.create({
        data: {
          salesOrderId: orderId,
          stage: "Shortage Detected",
          status: "RUNNING",
          message: `Shortage of ${shortage} units for ${line.product.name}`,
        },
      });

      await triggerProcurementEngine(
        line.productId,
        shortage,
        orderId
      );
    }
  }

  await prisma.salesOrder.update({
    where: { id: orderId },
    data: { status: "CONFIRMED" },
  });

  await createAuditLog({
    userId,
    action: "CONFIRM",
    module: "Sales",
    entityId: orderId,
    newValue: "CONFIRMED",
  });

  revalidatePath("/sales/orders");
  revalidatePath("/dashboard");
  revalidatePath("/control-tower");
  return { success: true };
}

export async function deliverSalesOrder(
  orderId: string,
  lineDeliveries: { lineId: string; quantity: number }[],
  userId?: string
) {
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: { lines: true },
  });
  if (!order) throw new Error("Order not found");

  const deliveryCount = await prisma.delivery.count();
  const delivery = await prisma.delivery.create({
    data: {
      deliveryNumber: generateOrderNumber("DEL", deliveryCount),
      salesOrderId: orderId,
    },
  });

  for (const { lineId, quantity } of lineDeliveries) {
    const line = order.lines.find((l) => l.id === lineId);
    if (!line) continue;

    await consumeStock(
      line.productId,
      quantity,
      order.orderNumber,
      MovementType.SALES_DELIVERY
    );

    await prisma.salesOrderLine.update({
      where: { id: lineId },
      data: { deliveredQty: { increment: quantity } },
    });
  }

  const updatedLines = await prisma.salesOrderLine.findMany({
    where: { salesOrderId: orderId },
  });

  const allDelivered = updatedLines.every(
    (l) => l.deliveredQty >= l.quantity
  );
  const anyDelivered = updatedLines.some((l) => l.deliveredQty > 0);

  let newStatus = order.status;
  if (allDelivered) newStatus = "DELIVERED";
  else if (anyDelivered) newStatus = "PARTIALLY_DELIVERED";

  await prisma.salesOrder.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  await prisma.journeyEvent.create({
    data: {
      salesOrderId: orderId,
      stage: "Delivered",
      status: "COMPLETED",
      message: `Delivery ${delivery.deliveryNumber} completed`,
    },
  });

  await createAuditLog({
    userId,
    action: "DELIVER",
    module: "Sales",
    entityId: orderId,
    newValue: newStatus,
  });

  revalidatePath("/sales/orders");
  revalidatePath("/inventory");
  revalidatePath("/control-tower");
  return { success: true, deliveryId: delivery.id };
}

export async function createSalesOrder(data: {
  customerId: string;
  lines: { productId: string; quantity: number; unitPrice: number }[];
  deliveryDate?: Date;
  notes?: string;
  userId?: string;
}) {
  const count = await prisma.salesOrder.count();
  const totalAmount = data.lines.reduce(
    (sum, l) => sum + l.quantity * l.unitPrice,
    0
  );

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber: generateOrderNumber("SO", count),
      customerId: data.customerId,
      deliveryDate: data.deliveryDate,
      notes: data.notes,
      totalAmount,
      createdById: data.userId,
      lines: {
        create: data.lines,
      },
    },
    include: { lines: true, customer: true },
  });

  await prisma.journeyEvent.create({
    data: {
      salesOrderId: order.id,
      stage: "SO Created",
      status: "COMPLETED",
      message: `Sales Order ${order.orderNumber} created`,
    },
  });

  await createAuditLog({
    userId: data.userId,
    action: "CREATE",
    module: "Sales",
    entityId: order.id,
    newValue: order.orderNumber,
  });

  revalidatePath("/sales/orders");
  return order;
}
