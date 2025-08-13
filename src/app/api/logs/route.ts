import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const ip = searchParams.get("ip");
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
