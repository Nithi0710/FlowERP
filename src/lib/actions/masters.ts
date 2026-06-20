"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission, requireAdmin } from "@/lib/rbac";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

async function audit(userId: string | undefined, action: string, module: string, entityId?: string) {
  await prisma.auditLog.create({
    data: { userId, action, module, entityId, newValue: action },
  });
}

// ─── Products ───
export async function createProduct(data: {
  name: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  categoryId?: string;
  vendorId?: string;
  procurementStrategy?: "MTS" | "MTO";
  procurementType?: "PURCHASE" | "MANUFACTURING";
  reorderLevel?: number;
  onHandQty?: number;
}) {
  const user = await requirePermission("masters:products");
  const product = await prisma.product.create({ data });
  await audit(user.id, "CREATE", "Product", product.id);
  revalidatePath("/masters/products");
  revalidatePath("/inventory");
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    sku: string;
    costPrice: number;
    salePrice: number;
    categoryId: string | null;
    vendorId: string | null;
    procurementStrategy: "MTS" | "MTO";
    procurementType: "PURCHASE" | "MANUFACTURING";
    reorderLevel: number;
    onHandQty: number;
    isActive: boolean;
  }>
) {
  const user = await requirePermission("masters:products");
  const product = await prisma.product.update({ where: { id }, data });
  await audit(user.id, "UPDATE", "Product", id);
  revalidatePath("/masters/products");
  revalidatePath("/inventory");
  return product;
}

export async function deleteProduct(id: string) {
  const user = await requirePermission("masters:products");
  await prisma.product.delete({ where: { id } });
  await audit(user.id, "DELETE", "Product", id);
  revalidatePath("/masters/products");
  return { success: true };
}

// ─── Categories ───
export async function createCategory(data: { name: string; description?: string }) {
  const user = await requirePermission("masters:categories");
  const cat = await prisma.category.create({ data });
  await audit(user.id, "CREATE", "Category", cat.id);
  revalidatePath("/masters/categories");
  return cat;
}

export async function updateCategory(id: string, data: { name?: string; description?: string }) {
  const user = await requirePermission("masters:categories");
  const cat = await prisma.category.update({ where: { id }, data });
  await audit(user.id, "UPDATE", "Category", id);
  revalidatePath("/masters/categories");
  return cat;
}

export async function deleteCategory(id: string) {
  const user = await requirePermission("masters:categories");
  await prisma.category.delete({ where: { id } });
  await audit(user.id, "DELETE", "Category", id);
  revalidatePath("/masters/categories");
  return { success: true };
}

export async function createCategoryFromForm(data: Record<string, string>) {
  return createCategory({ name: data.name, description: data.description || undefined });
}

export async function updateCategoryFromForm(id: string, data: Record<string, string>) {
  return updateCategory(id, { name: data.name, description: data.description });
}

// ─── Customers ───
export async function createCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  const user = await requirePermission("masters:customers");
  const c = await prisma.customer.create({ data });
  await audit(user.id, "CREATE", "Customer", c.id);
  revalidatePath("/masters/customers");
  return c;
}

export async function updateCustomer(
  id: string,
  data: Partial<{ name: string; email: string; phone: string; address: string; isActive: boolean }>
) {
  const user = await requirePermission("masters:customers");
  const c = await prisma.customer.update({ where: { id }, data });
  await audit(user.id, "UPDATE", "Customer", id);
  revalidatePath("/masters/customers");
  return c;
}

export async function deleteCustomer(id: string) {
  const user = await requirePermission("masters:customers");
  await prisma.customer.delete({ where: { id } });
  await audit(user.id, "DELETE", "Customer", id);
  revalidatePath("/masters/customers");
  return { success: true };
}

export async function createCustomerFromForm(data: Record<string, string>) {
  return createCustomer({
    name: data.name,
    email: data.email || undefined,
    phone: data.phone || undefined,
    address: data.address || undefined,
  });
}

export async function updateCustomerFromForm(id: string, data: Record<string, string>) {
  return updateCustomer(id, { name: data.name, email: data.email, phone: data.phone, address: data.address });
}

// ─── Vendors ───
export async function createVendor(data: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  const user = await requirePermission("masters:vendors");
  const v = await prisma.vendor.create({ data });
  await audit(user.id, "CREATE", "Vendor", v.id);
  revalidatePath("/masters/vendors");
  return v;
}

export async function updateVendor(
  id: string,
  data: Partial<{ name: string; email: string; phone: string; address: string; isActive: boolean }>
) {
  const user = await requirePermission("masters:vendors");
  const v = await prisma.vendor.update({ where: { id }, data });
  await audit(user.id, "UPDATE", "Vendor", id);
  revalidatePath("/masters/vendors");
  return v;
}

export async function deleteVendor(id: string) {
  const user = await requirePermission("masters:vendors");
  await prisma.vendor.delete({ where: { id } });
  await audit(user.id, "DELETE", "Vendor", id);
  revalidatePath("/masters/vendors");
  return { success: true };
}

export async function createVendorFromForm(data: Record<string, string>) {
  return createVendor({
    name: data.name,
    email: data.email || undefined,
    phone: data.phone || undefined,
    address: data.address || undefined,
  });
}

export async function updateVendorFromForm(id: string, data: Record<string, string>) {
  return updateVendor(id, { name: data.name, email: data.email, phone: data.phone, address: data.address });
}

// ─── Warehouses ───
export async function createWarehouse(data: { name: string; location?: string }) {
  const user = await requirePermission("masters:warehouses");
  const w = await prisma.warehouse.create({ data });
  await audit(user.id, "CREATE", "Warehouse", w.id);
  revalidatePath("/masters/warehouses");
  return w;
}

export async function updateWarehouse(
  id: string,
  data: Partial<{ name: string; location: string; isActive: boolean }>
) {
  const user = await requirePermission("masters:warehouses");
  const w = await prisma.warehouse.update({ where: { id }, data });
  await audit(user.id, "UPDATE", "Warehouse", id);
  revalidatePath("/masters/warehouses");
  return w;
}

export async function deleteWarehouse(id: string) {
  const user = await requirePermission("masters:warehouses");
  await prisma.warehouse.delete({ where: { id } });
  await audit(user.id, "DELETE", "Warehouse", id);
  revalidatePath("/masters/warehouses");
  return { success: true };
}

export async function createWarehouseFromForm(data: Record<string, string>) {
  return createWarehouse({ name: data.name, location: data.location || undefined });
}

export async function updateWarehouseFromForm(id: string, data: Record<string, string>) {
  return updateWarehouse(id, { name: data.name, location: data.location });
}

// ─── Work Centers ───
export async function createWorkCenter(data: {
  name: string;
  description?: string;
  capacity?: number;
}) {
  const user = await requirePermission("masters:work-centers");
  const wc = await prisma.workCenter.create({ data });
  await audit(user.id, "CREATE", "WorkCenter", wc.id);
  revalidatePath("/masters/work-centers");
  return wc;
}

export async function updateWorkCenter(
  id: string,
  data: Partial<{ name: string; description: string; capacity: number; isActive: boolean }>
) {
  const user = await requirePermission("masters:work-centers");
  const wc = await prisma.workCenter.update({ where: { id }, data });
  await audit(user.id, "UPDATE", "WorkCenter", id);
  revalidatePath("/masters/work-centers");
  return wc;
}

export async function deleteWorkCenter(id: string) {
  const user = await requirePermission("masters:work-centers");
  await prisma.workCenter.delete({ where: { id } });
  await audit(user.id, "DELETE", "WorkCenter", id);
  revalidatePath("/masters/work-centers");
  return { success: true };
}

export async function createWorkCenterFromForm(data: Record<string, string>) {
  return createWorkCenter({
    name: data.name,
    description: data.description || undefined,
    capacity: parseInt(data.capacity) || 10,
  });
}

export async function updateWorkCenterFromForm(id: string, data: Record<string, string>) {
  return updateWorkCenter(id, {
    name: data.name,
    description: data.description,
    capacity: parseInt(data.capacity) || 10,
  });
}

// ─── Units ───
export async function createUnit(data: { name: string; symbol: string }) {
  const user = await requirePermission("masters:units");
  const u = await prisma.unitOfMeasure.create({ data });
  await audit(user.id, "CREATE", "Unit", u.id);
  revalidatePath("/masters/units");
  return u;
}

export async function updateUnit(id: string, data: { name?: string; symbol?: string }) {
  const user = await requirePermission("masters:units");
  const u = await prisma.unitOfMeasure.update({ where: { id }, data });
  await audit(user.id, "UPDATE", "Unit", id);
  revalidatePath("/masters/units");
  return u;
}

export async function deleteUnit(id: string) {
  const user = await requirePermission("masters:units");
  await prisma.unitOfMeasure.delete({ where: { id } });
  await audit(user.id, "DELETE", "Unit", id);
  revalidatePath("/masters/units");
  return { success: true };
}

export async function createUnitFromForm(data: Record<string, string>) {
  return createUnit({ name: data.name, symbol: data.symbol });
}

export async function updateUnitFromForm(id: string, data: Record<string, string>) {
  return updateUnit(id, { name: data.name, symbol: data.symbol });
}

// ─── Operations ───
export async function createOperation(data: {
  name: string;
  description?: string;
  sequence?: number;
  duration?: number;
  workCenterId?: string;
}) {
  const user = await requirePermission("masters:operations");
  const op = await prisma.operation.create({
    data: {
      name: data.name,
      description: data.description,
      sequence: data.sequence ?? 0,
      duration: data.duration ?? 60,
      workCenterId: data.workCenterId || null,
    },
  });
  await audit(user.id, "CREATE", "Operation", op.id);
  revalidatePath("/masters/operations");
  return op;
}

export async function updateOperation(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    sequence: number;
    duration: number;
    workCenterId: string | null;
  }>
) {
  const user = await requirePermission("masters:operations");
  const op = await prisma.operation.update({ where: { id }, data });
  await audit(user.id, "UPDATE", "Operation", id);
  revalidatePath("/masters/operations");
  return op;
}

export async function deleteOperation(id: string) {
  const user = await requirePermission("masters:operations");
  await prisma.operation.delete({ where: { id } });
  await audit(user.id, "DELETE", "Operation", id);
  revalidatePath("/masters/operations");
  return { success: true };
}

export async function createOperationFromForm(data: Record<string, string>) {
  return createOperation({
    name: data.name,
    description: data.description || undefined,
    sequence: parseInt(data.sequence) || 0,
    duration: parseInt(data.duration) || 60,
    workCenterId: data.workCenterId || undefined,
  });
}

export async function updateOperationFromForm(id: string, data: Record<string, string>) {
  return updateOperation(id, {
    name: data.name,
    description: data.description,
    sequence: parseInt(data.sequence) || 0,
    duration: parseInt(data.duration) || 60,
    workCenterId: data.workCenterId || null,
  });
}

// ─── Users & Roles ───
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) {
  const admin = await requireAdmin();
  const hashed = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashed,
      role: data.role,
      companyId: admin.companyId,
    },
  });
  await audit(admin.id, "CREATE", "User", user.id);
  revalidatePath("/masters/users");
  return user;
}

export async function updateUser(
  id: string,
  data: Partial<{ name: string; email: string; role: Role; isActive: boolean; password?: string }>
) {
  const admin = await requireAdmin();
  const updateData: Record<string, unknown> = { ...data };
  delete updateData.password;
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }
  const user = await prisma.user.update({ where: { id }, data: updateData });
  await audit(admin.id, "UPDATE", "User", id);
  revalidatePath("/masters/users");
  return user;
}

export async function deleteUser(id: string) {
  const admin = await requireAdmin();
  await prisma.user.delete({ where: { id } });
  await audit(admin.id, "DELETE", "User", id);
  revalidatePath("/masters/users");
  return { success: true };
}
