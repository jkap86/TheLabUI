import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

/*
function getClientIpFromReq(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const first = xff
    .split(",")[0]
    ?.trim()
    .replace(/^::ffff:/, "");
  return first && /^[0-9a-fA-F:.\s]+$/.test(first) ? first : "0.0.0.0";
}
  */

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const ip = searchParams.get("ip"); // getClientIpFromReq(req);
  const route = searchParams.get("route");

  const insertLogQuery = `
    INSERT INTO logs(ip, route)
    VALUES ($1, $2);
  `;

  try {
    await pool.query(insertLogQuery, [ip, route]);
  } catch (err: unknown) {
    if (err instanceof Error) console.log(err.message);
  }

  return NextResponse.json("logged");
}
