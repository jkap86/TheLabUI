import pool from "@/lib/pool";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await pool.query(
      "SELECT * FROM common WHERE name = 'projections_ros'"
    );

    const projections_ros_db = data.rows[0];

    return NextResponse.json(projections_ros_db.data, { status: 200 });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
