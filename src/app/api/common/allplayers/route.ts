import { NextResponse } from "next/server";
import pool from "@/lib/pool";
import axiosInstance from "@/lib/axiosInstance";
import { Allplayer } from "@/lib/types/commonTypes";

export async function GET(req: Request) {
  try {
    const data = await pool.query(
      "SELECT * FROM common WHERE name = 'allplayers'"
    );

    const allplayers_db = data.rows[0];

    const freshInDb =
      allplayers_db &&
      new Date().getTime() - 1000 * 60 * 60 * 12 <
        new Date(allplayers_db.updated_at).getTime();

    const etag = allplayers_db
      ? `W/"${new Date(allplayers_db.updated_at).getTime()}"`
      : undefined;

    const ifNoneMatch = req.headers.get("if-none-match");

    if (freshInDb && etag && ifNoneMatch === etag) {
      // Client has the latest version

      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Last-Modified": new Date(allplayers_db.updated_at).toUTCString(),
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
        },
      });
    }

    if (freshInDb && allplayers_db) {
      const res = NextResponse.json(allplayers_db.data, { status: 200 });

      res.headers.set("ETag", etag!);
      res.headers.set(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=300"
      );

      return res;
    }

    try {
      const allplayers: { data: { [player_id: string]: Allplayer } } =
        await axiosInstance.get("https://api.sleeper.app/v1/players/nfl");

      const allplayersFiltered: Allplayer[] = [];

      Object.values(allplayers.data)
        .filter((player) => player.active)
        .forEach((value) => {
          const player_obj = value as Allplayer;

          allplayersFiltered.push({
            player_id: player_obj.player_id,
            position: player_obj.position === "FB" ? "RB" : player_obj.position,
            team: player_obj.team || "FA",
            full_name:
              player_obj.position === "DEF"
                ? `${player_obj.player_id} DEF`
                : player_obj.full_name,
            first_name: player_obj.first_name,
            last_name: player_obj.last_name,
            age: player_obj.age,
            fantasy_positions: (player_obj.fantasy_positions || []).map((p) => {
              if (p === "FB") {
                return "RB";
              } else {
                return p;
              }
            }),
            years_exp: player_obj.years_exp,
            active: player_obj.active,
          });
        });

      const now = new Date();

      await pool.query(
        `INSERT INTO common (name, data, updated_at) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (name) 
        DO UPDATE SET 
          data = EXCLUDED.data,
          updated_at = EXCLUDED.updated_at`,
        ["allplayers", JSON.stringify(allplayersFiltered), now]
      );

      const newEtag = `W/"${now.getTime()}"`;

      const res = NextResponse.json(allplayersFiltered, { status: 200 });
      res.headers.set("ETag", newEtag);
      res.headers.set(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=300"
      );
      return res;
    } catch (err: unknown) {
      if (allplayers_db) {
        const res = NextResponse.json(allplayers_db.data, { status: 200 });

        if (etag) res.headers.set("ETag", etag);

        res.headers.set(
          "Cache-Control",
          "public, s-maxage=600, stale-while-revalidate=60"
        );

        return res;
      }
      throw err;
    }
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to load players - ", err },
      { status: 500 }
    );
  }
}
