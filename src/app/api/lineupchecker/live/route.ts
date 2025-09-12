import { NextRequest, NextResponse } from "next/server";
import { getLiveStats } from "../helpers/getLiveStats";

const CC = "public, s-maxage=10, max-age=10, must-revalidate";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const week = searchParams.get("week");

  if (!week)
    return NextResponse.json("Error week not provided", { status: 400 });

  const { stats, delay } = await getLiveStats(week);

  return NextResponse.json(
    { stats, delay },
    { headers: { "Cache-Control": CC } }
  );
}
