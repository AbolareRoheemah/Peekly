import { NextRequest, NextResponse } from "next/server";

// user to be authenticated, e.g. a login page
const PUBLIC_PAGES = ["/sign-in"];

export async function middleware(req: NextRequest) {
  const cookieAuthToken = req.cookies.get("privy-token");
  const cookieSession = req.cookies.get("privy-session");
  const { pathname, searchParams, search } = req.nextUrl;

  if (PUBLIC_PAGES.includes(pathname)) {
    return NextResponse.next();
  }

  // Bypass middleware when `privy_oauth_code` is a query parameter, as
  // we are in the middle of an authentication flow
  if (searchParams.get("privy_oauth_code")) return NextResponse.next();

  // Bypass middleware when the /refresh page is fetched, otherwise
  // we will enter an infinite loop
  if (pathname === "/refresh") return NextResponse.next();

  // If the user has `privy-token`, they are definitely authenticated
  const definitelyAuthenticated = Boolean(cookieAuthToken);
  // If user has `privy-session`, they also have `privy-refresh-token` and
  // may be authenticated once their session is refreshed in the client
  const maybeAuthenticated = Boolean(cookieSession);

  if (!definitelyAuthenticated && maybeAuthenticated) {
    // If user is not authenticated, but is maybe authenticated
    // redirect them to the `/refresh` page to trigger client-side refresh flow
    // Correctly build the /refresh URL with redirect param
    const redirectTo = pathname + search;
    const refreshUrl = req.nextUrl.clone();
    refreshUrl.pathname = "/sign-in";
    refreshUrl.search = "";
    // refreshUrl.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(refreshUrl);
  }
  if (!definitelyAuthenticated && !maybeAuthenticated) {
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.search = "";
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (authentication endpoints)
     * - image file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
