"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateOrderNumber } from "@/lib/utils";
import { addStock, createAuditLog } from "./inventory";

export async function receivePurchaseOrder(
  orderId: string,
  lineReceipts: { lineId: string; quantity: number }[],
  userId?: string
) {
  const order = await prisma.purchaseOrder.findUnique({
    where: { id: orderId },
    include: { lines: true },
  });
  if (!order) throw new Error("Order not found");

  const receiptCount = await prisma.receipt.count();
  const receipt = await prisma.receipt.create({
    data: {
      receiptNumber: generateOrderNumber("REC", receiptCount),
      purchaseOrderId: orderId,
    },
  });

  for (const { lineId, quantity } of lineReceipts) {
    const line = order.lines.find((l) => l.id === lineId);
    if (!line) continue;

    await addStock(line.productId, quantity, order.orderNumber);

    await prisma.purchaseOrderLine.update({
      where: { id: lineId },
      data: { receivedQty: { increment: quantity } },
    });
  }

  const updatedLines = await prisma.purchaseOrderLine.findMany({
    where: { purchaseOrderId: orderId },
  });

  const allReceived = updatedLines.every(
    (l) => l.receivedQty >= l.quantity
  );
  const anyReceived = updatedLines.some((l) => l.receivedQty > 0);

  let newStatus = order.status;
  if (allReceived) newStatus = "RECEIVED";
  else if (anyReceived) newStatus = "PARTIALLY_RECEIVED";

  await prisma.purchaseOrder.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  await createAuditLog({
    userId,
    action: "RECEIVE",
    module: "Purchase",
    entityId: orderId,
    newValue: newStatus,
  });

  revalidatePath("/purchase/orders");
  revalidatePath("/inventory");
  return { success: true, receiptId: receipt.id };
}

export async function createPurchaseOrder(data: {
  vendorId: string;
  lines: { productId: string; quantity: number; unitPrice: number }[];
  expectedDate?: Date;
  notes?: string;
  userId?: string;
}) {
  const count = await prisma.purchaseOrder.count();
  const totalAmount = data.lines.reduce(
    (sum, l) => sum + l.quantity * l.unitPrice,
    0
  );

  const order = await prisma.purchaseOrder.create({
    data: {
      orderNumber: generateOrderNumber("PO", count),
      vendorId: data.vendorId,
      expectedDate: data.expectedDate,
      notes: data.notes,
      totalAmount,
      createdById: data.userId,
      lines: { create: data.lines },
    },
    include: { lines: true, vendor: true },
  });

  await createAuditLog({
    userId: data.userId,
    action: "CREATE",
    module: "Purchase",
    entityId: order.id,
    newValue: order.orderNumber,
  });

  revalidatePath("/purchase/orders");
  return order;
}

export async function confirmPurchaseOrder(orderId: string, userId?: string) {
  await prisma.purchaseOrder.update({
    where: { id: orderId },
    data: { status: "CONFIRMED" },
  });

  await createAuditLog({
    userId,
    action: "CONFIRM",
    module: "Purchase",
    entityId: orderId,
    newValue: "CONFIRMED",
  });

  revalidatePath("/purchase/orders");
  return { success: true };
}
