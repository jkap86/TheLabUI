import { NextRequest, NextResponse } from "next/server";
import { getSchedule } from "../helpers/getSchedule";
import { getProjections } from "../helpers/getProjections";
import { getAllplayers } from "../helpers/getAllplayers";
import pool from "@/lib/pool";
import { League, Matchup, ProjectionEdits } from "@/lib/types/userTypes";
import {
  SleeperMatchup,
  SleeperRoster,
  SleeperUser,
} from "@/lib/types/sleeperApiTypes";
import axiosInstance from "@/lib/axiosInstance";
import { getOptimalStartersLineupCheck } from "@/utils/getOptimalStarters";
import { upsertMatchups } from "../helpers/upsertMatchups";
import { getMatchupsLeagueIds } from "../helpers/getMatchupsLeagueIds";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const user_id = searchParams.get("user_id");
  const week = searchParams.get("week");

  const editsString = searchParams.get("edits");

  let edits: ProjectionEdits = {};

  if (editsString) edits = JSON.parse(editsString);

  if (!user_id)
    return NextResponse.json("No user_id provided", { status: 500 });

  if (!week) return NextResponse.json("No week provided", { status: 500 });

  const league_ids_all = await getMatchupsLeagueIds(user_id);

  if (!league_ids_all)
    return NextResponse.json("Error getting leagues", { status: 500 });

  const {
    rows: [ver],
  } = await pool.query(
    `SELECT to_char(MAX(updated_at), 'YYYYMMDDHH24MISSMS') AS maxu,
          COUNT(*)::int AS cnt
     FROM matchups
    WHERE league_id = ANY($1::text[])
      AND week = $2::int`,
    [league_ids_all, parseInt(week as string)]
  );

  const etag = `"u=${user_id};w=${week};cnt=${ver?.cnt ?? 0};mAt=${
    ver?.maxu ?? 0
  }"`;

  console.log({ etag, inm: req.headers.get("if-none-match") });

  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        "Cache-Control": "private, max-age=0, stale-while-revalidate=300",
        ETag: etag,
        Vary: "Accept",
      },
    });
  }

  const schedule_week = await getSchedule(week);
  const projections_week = await getProjections(week);
  const allplayers = await getAllplayers();

  const getUpdatedMatchups = async (league_ids_batch: string[]) => {
    const getMatchupsQuery = `
    WITH grouped AS (
        SELECT
            m.league_id,
            jsonb_agg(to_jsonb(m) ORDER BY m.roster_id) AS matchups
        FROM matchups AS m
        WHERE m.league_id = ANY($1::text[])
            AND m.week      = $2::int
        GROUP BY m.league_id
        )
    SELECT g.league_id, g.matchups, to_jsonb(l) AS league
    FROM grouped g
    JOIN leagues l ON l.league_id = g.league_id
    ORDER BY g.league_id;
  `;

    const matchups_update: {
      rows: { league_id: string; league: League; matchups: Matchup[] }[];
    } = await pool.query(getMatchupsQuery, [
      league_ids_batch,
      parseInt(week as string),
    ]);

    const cutoff = new Date(Date.now() - 1000 * 60);

    const up_to_date_matchups = matchups_update.rows.filter((l) => {
      return edits
        ? true
        : l.matchups.some(
            (m) => m.updated_at && new Date(m.updated_at) > cutoff
          );
    });

    const league_ids_to_update = league_ids_batch.filter(
      (league_id: string) =>
        !up_to_date_matchups.some((m) => m.league_id === league_id)
    );

    const updated_matchups: {
      league_id: string;
      league: League;
      matchups: Matchup[];
    }[] = [];

    await Promise.all(
      league_ids_to_update.map(async (league_id: string) => {
        let league = matchups_update.rows.find(
          (r) => r.league_id === league_id
        )?.league;

        try {
          if (!league) {
            const leagueSleeper = await axiosInstance.get(
              `https://api.sleeper.app/v1/league/${league_id}`
            );
            league = leagueSleeper.data as League;
          }
        } catch (e: unknown) {
          if (e instanceof Error) console.log(e.message);
          return e;
        }

        try {
          const [matchups, rosters, users]: [
            { data: SleeperMatchup[] },
            { data: SleeperRoster[] },
            { data: SleeperUser[] }
          ] = await Promise.all([
            await axiosInstance.get(
              `https://api.sleeper.app/v1/league/${league_id}/matchups/${week}`
            ),
            await axiosInstance.get(
              `https://api.sleeper.app/v1/league/${league_id}/rosters`
            ),
            await axiosInstance.get(
              `https://api.sleeper.app/v1/league/${league_id}/users`
            ),
          ]);

          const roster_user = rosters.data.find(
            (r: SleeperRoster) => r.owner_id === user_id
          );

          if (roster_user) {
            const roster_id_user = roster_user.roster_id;

            const matchup_user = matchups.data.find(
              (m: SleeperMatchup) => m.roster_id === roster_id_user
            );

            const roster_id_opp = matchups.data.find(
              (m: SleeperMatchup) =>
                m.matchup_id === matchup_user?.matchup_id &&
                m.roster_id !== roster_id_user
            )?.roster_id;

            const updated_matchups_league: Matchup[] = [];

            matchups.data.forEach((m: SleeperMatchup) => {
              const user = users.data.find(
                (u: SleeperUser) =>
                  u.user_id ===
                  rosters.data.find(
                    (r: SleeperRoster) => r.roster_id === m.roster_id
                  )?.owner_id
              );

              const {
                starters_optimal,
                values,
                projection_current,
                projection_optimal,
              } = getOptimalStartersLineupCheck(
                allplayers,
                league.roster_positions,
                m.players,
                m.starters,
                projections_week,
                league.scoring_settings,
                schedule_week,
                { edits }
              );

              const {
                starters_optimal: starters_optimal_locked,
                projection_current: projection_current_locked,
                projection_optimal: projection_optimal_locked,
              } = getOptimalStartersLineupCheck(
                allplayers,
                league.roster_positions,
                m.players,
                m.starters,
                projections_week,
                league.scoring_settings,
                schedule_week,
                { edits, locked: true }
              );

              updated_matchups_league.push({
                ...m,
                starters:
                  league.settings.best_ball === 1
                    ? starters_optimal.map((so) => so.optimal_player_id)
                    : m.starters,
                week: parseInt(week as string),
                updated_at: new Date(),
                league_id,
                roster_id_user,
                roster_id_opp,
                username: user?.display_name || "Orphan",
                avatar: user?.avatar || null,
                user_id: user?.user_id || "0",
                starters_optimal,
                values,
                projection_current:
                  league.settings.best_ball === 1
                    ? projection_optimal
                    : projection_current,
                projection_optimal,
                starters_optimal_locked:
                  league.settings.best_ball === 1
                    ? starters_optimal
                    : starters_optimal_locked,
                projection_current_locked:
                  league.settings.best_ball === 1
                    ? projection_optimal
                    : projection_current_locked,
                projection_optimal_locked:
                  league.settings.best_ball === 1
                    ? projection_optimal
                    : projection_optimal_locked,
              });
            });

            await upsertMatchups(updated_matchups_league);

            updated_matchups.push({
              league_id,
              league: {
                ...league,
                index: league_ids_all.indexOf(league.league_id),
              },
              matchups: updated_matchups_league,
            });
          }
        } catch (err: unknown) {
          if (err instanceof Error) console.log(err.message);
        }
      })
    );

    const matchups = [...updated_matchups];

    up_to_date_matchups.forEach((mobj) => {
      const matchup_user = mobj.matchups.find((m) => m.user_id === user_id);
      const roster_id_user = matchup_user?.roster_id;

      const roster_id_opp = mobj.matchups.find(
        (m2) =>
          m2.roster_id !== roster_id_user &&
          m2.matchup_id === matchup_user?.matchup_id
      )?.roster_id;

      if (roster_id_user) {
        matchups.push({
          ...mobj,
          league: {
            ...mobj.league,
            index: league_ids_all.indexOf(mobj.league.league_id),
          },
          matchups: mobj.matchups.map((m) => {
            const {
              starters_optimal,
              values,
              projection_current,
              projection_optimal,
            } = getOptimalStartersLineupCheck(
              allplayers,
              mobj.league.roster_positions,
              m.players,
              m.starters,
              projections_week,
              mobj.league.scoring_settings,
              schedule_week,
              { edits }
            );

            const {
              starters_optimal: starters_optimal_locked,
              projection_current: projection_current_locked,
              projection_optimal: projection_optimal_locked,
            } = getOptimalStartersLineupCheck(
              allplayers,
              mobj.league.roster_positions,
              m.players,
              m.starters,
              projections_week,
              mobj.league.scoring_settings,
              schedule_week,
              { edits, locked: true }
            );
            return {
              ...m,
              starters:
                mobj.league.settings.best_ball === 1
                  ? starters_optimal.map((so) => so.optimal_player_id)
                  : m.starters,
              roster_id_user,
              roster_id_opp,
              starters_optimal,
              values,
              projection_current:
                mobj.league.settings.best_ball === 1
                  ? projection_optimal
                  : projection_current,
              projection_optimal,
              starters_optimal_locked:
                mobj.league.settings.best_ball === 1
                  ? starters_optimal
                  : starters_optimal_locked,
              projection_current_locked:
                mobj.league.settings.best_ball === 1
                  ? projection_optimal
                  : projection_current_locked,
              projection_optimal_locked:
                mobj.league.settings.best_ball === 1
                  ? projection_optimal
                  : projection_optimal_locked,
            };
          }),
        });
      }
    });

    return matchups;
  };

  const batchSize = 10;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const l = league_ids_all; /*.filter(
        (league_id: string) => league_id !== "1217887034689978368"
      );*/
      try {
        for (let i = 0; i < l.length; i += batchSize) {
          const batchMatchups = await getUpdatedMatchups(
            l.slice(i, i + batchSize)
          );

          const batchData = JSON.stringify(batchMatchups) + "\n";

          controller.enqueue(encoder.encode(batchData));
        }

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              schedule: schedule_week,
              projections: projections_week,
            }) + "\n"
          )
        );

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
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "private, max-age=0, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
      Connection: "keep-alive",
    },
  });
}
