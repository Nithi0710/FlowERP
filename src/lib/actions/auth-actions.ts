"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAuth, requireAdmin } from "@/lib/rbac";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "company";
}

async function uniqueSlug(base: string) {
  let slug = slugify(base);
  let n = 0;
  while (await prisma.company.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugify(base)}-${n}`;
  }
  return slug;
}

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  jobTitle?: string;
  companyName: string;
  domain?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  companyPhone?: string;
  website?: string;
  taxId?: string;
};

export async function registerUser(data: RegisterInput) {
  const email = data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  if (!data.companyName.trim()) {
    return { error: "Company name is required" };
  }

  const domain = data.domain?.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") || null;

  if (domain) {
    const domainTaken = await prisma.company.findUnique({ where: { domain } });
    if (domainTaken) {
      return { error: "This company domain is already registered. Contact your admin for access." };
    }
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const slug = await uniqueSlug(data.companyName);

  try {
    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: data.companyName.trim(),
          slug,
          domain,
          industry: data.industry?.trim() || null,
          address: data.address?.trim() || null,
          city: data.city?.trim() || null,
          state: data.state?.trim() || null,
          country: data.country?.trim() || "India",
          postalCode: data.postalCode?.trim() || null,
          phone: data.companyPhone?.trim() || null,
          email,
          website: data.website?.trim() || null,
          taxId: data.taxId?.trim() || null,
        },
      });

      await tx.user.create({
        data: {
          name: data.name.trim(),
          email,
          password: hashed,
          phone: data.phone?.trim() || null,
          jobTitle: data.jobTitle?.trim() || null,
          role: Role.ADMIN,
          companyId: company.id,
        },
      });
    });
  } catch (error) {
    console.error("registerUser error:", error);
    return { error: "Unable to create company. Please try again." };
  }

  return { success: true };
}

export async function getCompanyByUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true },
  });
  return user?.company ?? null;
}

export async function updateCompany(data: {
  name?: string;
  domain?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
}) {
  const sessionUser = await requireAdmin();
  const dbUser = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!dbUser?.companyId) throw new Error("No company linked to this account");

  const domain = data.domain?.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") || undefined;

  if (domain) {
    const existing = await prisma.company.findFirst({
      where: { domain, NOT: { id: dbUser.companyId } },
    });
    if (existing) throw new Error("Domain already used by another company");
  }

  const company = await prisma.company.update({
    where: { id: dbUser.companyId },
    data: {
      name: data.name?.trim(),
      domain,
      industry: data.industry?.trim(),
      address: data.address?.trim(),
      city: data.city?.trim(),
      state: data.state?.trim(),
      country: data.country?.trim(),
      postalCode: data.postalCode?.trim(),
      phone: data.phone?.trim(),
      email: data.email?.trim(),
      website: data.website?.trim(),
      taxId: data.taxId?.trim(),
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return company;
}

export async function getSessionCompany() {
  const sessionUser = await requireAuth();
  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { company: true },
  });
  return dbUser?.company ?? null;
}
