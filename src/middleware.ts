import axios from "axios";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    // Extract IP address from the request
    const ipAddress = request.headers.get("x-forwarded-for") || "Unknown IP";

    // Get the current timestamp

    // Log details

    const redirectUrl = new URL(
      "/api/log",
      "https://the-lab.southharmonff.com"
    );

    redirectUrl.searchParams.set("ip", ipAddress);
    redirectUrl.searchParams.set("route", request.nextUrl.pathname);

    try {
      await axios.get(redirectUrl.toString());
    } catch (err: unknown) {
      if (err instanceof Error) console.log(err.message);
    }
  }

  // Proceed with the request
  return NextResponse.next();
}

// Define the routes this middleware applies to
export const config = {
  matcher: [
    "/manager/:path",
    "/lineupchecker/:path",
    "/trades/:path",
    "/picktracker/:path",
  ],
};
