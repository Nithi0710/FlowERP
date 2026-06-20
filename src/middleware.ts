import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { hasPermission, ROUTE_PERMISSIONS } from "@/lib/permissions";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as Role | undefined;
    const path = req.nextUrl.pathname;

    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
      if (path === route || path.startsWith(route + "/")) {
        if (!hasPermission(role, permission)) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        break;
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/masters/:path*",
    "/sales/:path*",
    "/purchase/:path*",
    "/manufacturing/:path*",
    "/inventory/:path*",
    "/analytics/:path*",
    "/reports/:path*",
    "/control-tower",
    "/journey",
    "/war-room",
    "/manufacturing-command",
    "/procurement-center",
    "/inventory-health",
    "/settings",
  ],
};
