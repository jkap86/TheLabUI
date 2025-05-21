import axiosInstance from "@/lib/axiosInstance";
import pool from "@/lib/pool";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const data = await pool.query(
      "SELECT * FROM common WHERE name = 'projections_ros'"
    );

    const projections_ros_db = data.rows[0];

    if (
      new Date().getTime() -
        new Date(projections_ros_db?.updated_at).getTime() <
      1000 * 60 * 60 * 12
    ) {
      return NextResponse.json(projections_ros_db.data, { status: 200 });
    } else {
      const proj = await axiosInstance.get(
        `https://api.sleeper.com/projections/nfl/2025/?season_type=regular`
      );

      const data = proj.data.filter(
        (p: { stats: { pts_ppr?: number } }) => p.stats.pts_ppr
      );

      await pool.query(
        `INSERT INTO common (name, data, updated_at) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (name) 
        DO UPDATE SET 
          data = EXCLUDED.data,
          updated_at = EXCLUDED.updated_at`,
        ["projections_ros", JSON.stringify(data), new Date()]
      );
      return NextResponse.json(data);
    }
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
