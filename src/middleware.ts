import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";
import acceptLanguage from "accept-language";
import language from "../languages.json";

const isPrivateRoute = createRouteMatcher(["/demo(.*)"]);

const languages = language.languages;
acceptLanguage.languages(languages);

export default clerkMiddleware(async (auth, request) => {
  if (isPrivateRoute(request)) {
    await auth.protect();
  }

  let lng;
  if (!lng) lng = acceptLanguage.get(request.headers.get("Accept-Language"));
  if (!lng) lng = language.fallbackLng;

  if (
    !languages.some((loc) => request.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !request.nextUrl.pathname.startsWith("/_next") &&
    !request.nextUrl.pathname.startsWith("/api")
  ) {
    const locale = lng;

    return NextResponse.redirect(
      new URL(
        `/${locale}${request.nextUrl.pathname}${request.nextUrl.search}`,
        request.url
      )
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
