import { NextRequest, NextResponse } from "next/server";
import { updateLeagues } from "../helpers/updateLeagues";
import { Roster } from "@/lib/types/userTypes";
import pool from "@/lib/pool";
import { Allplayer } from "@/lib/types/commonTypes";
import { getRosterStats } from "../helpers/getRosterStats";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const league_id = searchParams.get("league_id") as string;
  const userRoster_id = parseInt(searchParams.get("roster_id") || "0");
  const week = searchParams.get("week");

  try {
    const projections_db: {
      player_id: string;
      stats: { [cat: string]: number };
    }[] = await (
      await pool.query("SELECT * FROM common WHERE name = 'projections_ros'")
    ).rows[0].data;

    const projections = Object.fromEntries(
      projections_db.map((p) => [p.player_id, p.stats])
    );

    const allplayers_db = await (
      await pool.query("SELECT * FROM common WHERE name = 'allplayers'")
    ).rows[0].data;

    const allplayers = Object.fromEntries(
      allplayers_db.map((p: Allplayer) => [p.player_id, p])
    );

    const ktc_dynasty = await (
      await pool.query("SELECT * FROM common WHERE name = 'ktc_dates_dynasty'")
    ).rows[0].data;

    const ktcCurrent = {
      dynasty:
        ktc_dynasty[
          Object.keys(ktc_dynasty).sort(
            (a, b) => new Date(b).getTime() - new Date(a).getTime()
          )[0]
        ],
      redraft: {},
    };

    const updatedLeague = await updateLeagues([league_id], [league_id], week);

    const league = updatedLeague[0];

    const rosters_stats = getRosterStats(
      league,
      projections,
      allplayers,
      ktcCurrent
    );

    const user_roster = rosters_stats.find(
      (roster: Roster) =>
        roster.roster_id === userRoster_id && (roster.players || []).length > 0
    );

    const league_to_send = {
      ...updatedLeague[0],
      rosters: rosters_stats,
      user_roster,
    };

    return NextResponse.json(league_to_send, {
      status: 200,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
      return NextResponse.json(err.message);
    } else {
      console.log({ err });
      return NextResponse.json("unkown error");
    }
  }
}
