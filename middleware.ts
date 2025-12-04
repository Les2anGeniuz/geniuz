import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("admin_id")?.value;

  const protectedPaths = ["/admin", "/api/kelas", "/api/fakultas", "/api/mentor"];

  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/kelas/:path*",
    "/api/fakultas/:path*",
    "/api/mentor/:path*",
  ],
};