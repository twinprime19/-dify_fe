import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Get token with secure: false to ensure cookies are read properly
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });

  console.log("Middleware path:", req.nextUrl.pathname);
  console.log("Auth token exists:", !!token);

  // Paths that don't require authentication
  const publicPaths = [
    "/auth/signin",
    "/api/auth",
    "/favicon.ico",
    "/_next",
    "/images",
    "/public",
    "/chat" // Allow bypass for development
    // Add other public paths here if needed
  ];

  const isPublicPath = publicPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  );

  // Special case: If we're at the root path "/" and have a token, allow access
  if (req.nextUrl.pathname === "/" && token) {
    return NextResponse.next();
  }

  // If not authenticated and not on public path, redirect to sign-in
  if (!token && !isPublicPath) {
    // Redirect to sign-in page for all protected routes
    const signInUrl = new URL("/auth/signin", req.url);
    // Set the callback URL
    signInUrl.searchParams.set("callbackUrl", "/");
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Exclude static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
