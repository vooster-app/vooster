import { updateSession } from "@vooster/supabase/middleware";
import { createI18nMiddleware } from "next-international/middleware";
import { type NextRequest, NextResponse } from "next/server";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/api/auth/callback"];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    // Handle i18n first
    const i18nResponse = I18nMiddleware(request);

    // If we're on a public route, just return the i18n response
    if (isPublicRoute(pathname)) {
      return i18nResponse;
    }

    // Handle auth for protected routes
    const { response, user } = await updateSession(request, i18nResponse);

    // If the response is already a redirect, return it immediately
    if (response.headers.get("location")) {
      return response;
    }

    // If no user and not on a public route, redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);

      // Only add redirectTo if we're not already on a public route
      if (!isPublicRoute(pathname)) {
        loginUrl.searchParams.set("redirectTo", pathname);
      }

      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch (error) {
    // Log the error and redirect to login as a fallback
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth/callback (auth callback)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth/callback).*)",
  ],
};
