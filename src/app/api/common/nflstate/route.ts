import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";
import axiosInstance from "@/lib/axiosInstance";

export async function GET(req: NextRequest) {
  try {
    const data = await pool.query(
      "SELECT * FROM common WHERE name = 'nflState'"
    );

    const nflState_db = data.rows[0];

    if (
      new Date().getTime() - new Date(nflState_db?.updated_at).getTime() <
      1000 * 60 * 60
    ) {
      return NextResponse.json(nflState_db.data, { status: 200 });
    } else {
      const nflState = await axiosInstance.get(
        "https://api.sleeper.app/v1/state/nfl"
      );

      const data = {
        ...nflState.data,
        thelab_season: process.env.SEASON,
      };
      await pool.query(
        "INSERT INTO common (name, data) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET data = $2",
        ["nflState", data]
      );

      return NextResponse.json(data, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json("Error fetching nfl state", { status: 500 });
  }
}
