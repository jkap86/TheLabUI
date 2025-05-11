import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";
import axiosInstance from "@/lib/axiosInstance";
import { Allplayer } from "@/lib/types/commonTypes";

export async function GET(req: NextRequest) {
  try {
    const data = await pool.query(
      "SELECT * FROM common WHERE name = 'allplayers'"
    );

    const allplayers_db = data.rows[0];

    if (
      new Date().getTime() - new Date(allplayers_db?.updated_at).getTime() <
      1000 * 60 * 60 * 12
    ) {
      return NextResponse.json(allplayers_db.data, { status: 200 });
    } else {
      const allplayers: { data: { [player_id: string]: Allplayer } } =
        await axiosInstance.get("https://api.sleeper.app/v1/players/nfl");

      const allplayersFiltered: Allplayer[] = [];

      Object.values(allplayers.data).forEach((value) => {
        const player_obj = value as Allplayer;

        allplayersFiltered.push({
          player_id: player_obj.player_id,
          position: player_obj.position,
          team: player_obj.team || "FA",
          full_name:
            player_obj.position === "DEF"
              ? `${player_obj.player_id} DEF`
              : player_obj.full_name,
          first_name: player_obj.first_name,
          last_name: player_obj.last_name,
          age: player_obj.age,
          fantasy_positions: player_obj.fantasy_positions,
          years_exp: player_obj.years_exp,
          active: player_obj.active,
        });
      });

      await pool.query(
        `INSERT INTO common (name, data, updated_at) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (name) 
        DO UPDATE SET 
          data = EXCLUDED.data,
          updated_at = EXCLUDED.updated_at`,
        ["allplayers", JSON.stringify(allplayersFiltered), new Date()]
      );

      return NextResponse.json(allplayersFiltered, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
