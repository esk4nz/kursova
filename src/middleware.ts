import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if ((pathname === "/sign-in" || pathname === "/sign-up") && token) {
    return NextResponse.redirect(new URL("/user-profile", req.url));
  }

  if (
    pathname.startsWith("/manager") &&
    token &&
    !["Admin", "Manager"].includes(token.userRole)
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/manager") && !token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (pathname.startsWith("/api/protected")) {
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    if (!["Admin", "Manager"].includes(token.userRole)) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/manager/:path*", "/api/protected/:path*"],
};
