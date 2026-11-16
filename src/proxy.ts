import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, homePathFor, verifyToken } from "@/lib/token";

/**
 * Optimistic route protection: a quick redirect before the page renders.
 * The pages and API routes check the session again (src/lib/auth.ts), so this
 * is a convenience, not the only line of defence.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await verifyToken(request.cookies.get(COOKIE_NAME)?.value);

  const isPublicAuthPage = pathname === "/login" || pathname === "/register";
  if (isPublicAuthPage) {
    return user ? NextResponse.redirect(new URL(homePathFor(user.role), request.url)) : NextResponse.next();
  }

  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const inStudentArea = pathname === "/student" || pathname.startsWith("/student/");
  const inStaffArea = pathname === "/staff" || pathname.startsWith("/staff/");
  if ((inStudentArea && user.role !== "STUDENT") || (inStaffArea && user.role === "STUDENT")) {
    return NextResponse.redirect(new URL(homePathFor(user.role), request.url));
  }
  // admin-only pages: ordinary staff go back to the staff home
  const adminOnly = ["/staff/menu", "/staff/suppliers", "/staff/sales"].some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (adminOnly && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/staff", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/student/:path*", "/staff/:path*"],
};
