import { LeagueDb } from "@/lib/types/dbTypes";
import { SleeperLeague } from "@/lib/types/sleeperApiTypes";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pool";
import { updateLeagues } from "./helpers/updateLeagues";
import { League, Roster } from "@/lib/types/userTypes";
import axiosInstance from "@/lib/axiosInstance";
import { Allplayer } from "@/lib/types/commonTypes";
import { getRosterStats } from "./helpers/getRosterStats";

export async function GET(req: NextRequest) {
  const league_update_cutoff: Date = new Date(Date.now() - 3 * 60 * 60 * 1000);

  const { searchParams } = new URL(req.url);

  const user_id = searchParams.get("user_id");
  const week = searchParams.get("week");

  try {
    const projections_db: {
      player_id: string;
      stats: { [cat: string]: number };
    }[] = await (
      await pool.query("SELECT * FROM common WHERE name = 'projections_ros'")
    ).rows[0]?.data;

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

    const leagues = await axiosInstance.get(
      `https://api.sleeper.app/v1/user/${user_id}/leagues/nfl/${process.env.SEASON}`
    );

    console.log({ LEN: leagues.data.length });
    const processLeagues = async (leaguesBatch: SleeperLeague[]) => {
      const league_ids = leaguesBatch.map(
        (league: SleeperLeague) => league.league_id
      );

      const findUpdatedLeaguesQuery = `
      SELECT * FROM leagues WHERE league_id = ANY($1);
    `;

      const result = await pool.query(findUpdatedLeaguesQuery, [league_ids]);

      const upToDateLeagues = result.rows?.filter(
        (league) => league.updated_at > league_update_cutoff
      );

      const upToDateLeagueIds = upToDateLeagues.map(
        (league) => league.league_id
      );

      const leagueIdsToUpdate = leaguesBatch
        ?.filter(
          (league: SleeperLeague) =>
            !upToDateLeagueIds.includes(league.league_id)
        )
        ?.map((league) => league.league_id);

      const updatedLeagues = await updateLeagues(
        leagueIdsToUpdate,
        result.rows.map((r) => r.league_id),
        week
      );

      const leagues_to_send: League[] = [];

      [...upToDateLeagues, ...updatedLeagues].forEach((league) => {
        const rosters_stats = getRosterStats(
          league,
          projections,
          allplayers,
          ktcCurrent
        );

        const user_roster = rosters_stats.find(
          (roster: Roster) =>
            roster.user_id === user_id && (roster.players || []).length > 0
        );

        if (user_roster) {
          const index = leagues.data.findIndex(
            (league_sleeper: LeagueDb) =>
              league_sleeper.league_id === league.league_id
          );

          leagues_to_send.push({
            ...league,
            rosters: rosters_stats,
            index,
            user_roster,
          });
        }
      });

      return leagues_to_send;
    };

    const batchSize = 25;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < leagues.data.length; i += batchSize) {
            const batchLeagues = await processLeagues(
              leagues.data.slice(i, i + batchSize)
            );

            const batchData =
              JSON.stringify(batchLeagues) +
              (i + batchSize > leagues.data.length ? "" : "\n");

            controller.enqueue(new TextEncoder().encode(batchData));
          }

          controller.close();
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.log(err.message);
            controller.error(err.message);
          } else {
            console.log({ err });
            controller.error("unkown error");
          }
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: { "Content-Type": "application/json" },
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
