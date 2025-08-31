import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const week = searchParams.get("week");
}
