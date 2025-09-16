import axios from "axios";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  //if (process.env.NODE_ENV === "production") {
  // Extract IP address from the request
  const ipAddress = request.headers.get("x-forwarded-for") || "Unknown IP";

  // Get the current timestamp

  // Log details

  const url =
    process.env.NODE_ENV === "production"
      ? "https://the-lab.southharmonff.com"
      : "http://localhost:3000";
  const redirectUrl = new URL("/api/logs", url);

  redirectUrl.searchParams.set("route", request.nextUrl.pathname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 200);

  try {
    axios
      .get(redirectUrl.toString(), {
        signal: controller.signal,
        headers: { "cache-control": "no-store" },
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
  } catch (err: unknown) {
    if (err instanceof Error) console.log(err.message);
  }
  //}

  // Proceed with the request
  return NextResponse.next();
}

// Define the routes this middleware applies to
export const config = {
  matcher: [
    "/manager/:path+",
    "/lineupchecker/:path+",
    "/trades/:path*",
    "/picktracker/:path+",
  ],
};
