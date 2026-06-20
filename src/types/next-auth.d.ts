import "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
      companyId?: string;
      companyName?: string;
    };
  }

  interface User {
    role?: Role;
    companyId?: string | null;
    companyName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    id?: string;
    companyId?: string | null;
    companyName?: string | null;
  }
}
