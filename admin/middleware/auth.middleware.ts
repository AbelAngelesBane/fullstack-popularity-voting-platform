import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  const isProtectedRoute = 
    pathname === "/" || 
    pathname.startsWith("/invoices") || 
    pathname.startsWith("/polls") || 
    pathname.startsWith("/reports");

  const isAuthRoute = pathname.startsWith("/auth");

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/signin", request.url);
    loginUrl.searchParams.set("from", pathname); 
    return NextResponse.redirect(loginUrl);
  }


  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}