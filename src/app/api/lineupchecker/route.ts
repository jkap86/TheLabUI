import axiosInstance from "@/lib/axiosInstance";
import pool from "@/lib/pool";
import {
  SleeperLeague,
  SleeperMatchup,
  SleeperRoster,
  SleeperUser,
} from "@/lib/types/sleeperApiTypes";
import { Matchup, ProjectionEdits, Roster } from "@/lib/types/userTypes";
import { getOptimalStartersLineupCheck } from "@/utils/getOptimalStarters";
import { NextRequest, NextResponse } from "next/server";
import { upsertMatchups } from "./helpers/upsertMatchups";
import { getSchedule } from "./helpers/getSchedule";
import { getProjections } from "./helpers/getProjections";
import { getAllplayers } from "./helpers/getAllplayers";

export async function POST(req: NextRequest) {
  const formData = await req.json();

  const {
    searched,
    week,
    edits,
  }: { searched: string; week: string; edits?: ProjectionEdits } = formData;

  let user_id;

  try {
    user_id = (
      await axiosInstance.get(`https://api.sleeper.app/v1/user/${searched}`)
    )?.data?.user_id;
  } catch (err: unknown) {
    console.log({ err });
  }

  if (!user_id) return NextResponse.json("Username not found", { status: 404 });

  let leagues: { data: SleeperLeague[] } | undefined;

  try {
    leagues = await axiosInstance.get(
      `https://api.sleeper.app/v1/user/${user_id}/leagues/nfl/${process.env.SEASON}`
    );
  } catch (err: unknown) {
    console.log({ err });
  }

  if (!leagues)
    return NextResponse.json("Error fetching user leagues", { status: 404 });

  const schedule_week = await getSchedule(week);
  const projections_week = await getProjections(week);
  const allplayers = await getAllplayers();

  const league_ids = leagues.data
    .filter((l: SleeperLeague) => l.status === "in_season")
    .map((l: SleeperLeague) => l.league_id);

  let matchups;

  try {
    const findMatchupsQuery = `
      SELECT m.*, to_jsonb(l) AS league
      FROM matchups m 
      JOIN leagues  l
      ON m.league_id = l.league_id
      WHERE m.league_id = ANY($1)
      AND week = $2;
    `;

    const matchups_update = await pool.query(findMatchupsQuery, [
      league_ids,
      parseInt(week as string),
    ]);

    const cutoff = new Date(Date.now() - 1 * 60 * 60 * 24);

    const up_to_date_matchups = matchups_update.rows
      .filter((m) => new Date(m.updated_at) > cutoff)
      .map((m) => {
        const matchups_league = matchups_update.rows.filter(
          (m2) => m2.league_id === m.league_id
        );

        const league = leagues.data.find(
          (league) => league.league_id === m.league_id
        ) as SleeperLeague;

        const roster_id_user = m.rosters.find(
          (r: Roster) => r.user_id === user_id
        )?.roster_id;

        const matchup_user = matchups_league.find(
          (m: SleeperMatchup) => m.roster_id === roster_id_user
        );

        const roster_id_opp = matchups_league.find(
          (m: SleeperMatchup) =>
            m.matchup_id === matchup_user?.matchup_id &&
            m.roster_id !== roster_id_user
        )?.roster_id;

        const { starters_optimal, projection_current, projection_optimal } =
          getOptimalStartersLineupCheck(
            allplayers,
            m.roster_positions,
            m.players,
            m.starters,
            projections_week,
            m.scoring_settings,
            schedule_week,
            edits
          );
        const { ...up_to_date_matchup } = {
          ...m,
          starters:
            league.settings.best_ball === 1
              ? starters_optimal.map((so) => so.optimal_player_id)
              : m.starters,
          roster_id_user,
          roster_id_opp,
          league: {
            index: leagues.data.findIndex((l) => l.league_id === m.league_id),
            name: m.name,
            avatar: m.avatar,
            scoring_settings: m.scoring_settings,
            settings: m.settings,
            roster_positions: m.roster_positions,
          },
          starters_optimal: starters_optimal,
          projection_current:
            league.settings.best_ball === 1
              ? projection_optimal
              : projection_current,
          projection_optimal,
        };

        return up_to_date_matchup;
      });

    const league_ids_to_update = league_ids.filter(
      (league_id: string) =>
        !up_to_date_matchups.some((m) => m.league_id === league_id)
    );

    const batchSize = 10;

    const updated_matchups: Matchup[] = [];

    for (let i = 0; i < league_ids_to_update.length; i += batchSize) {
      await Promise.all(
        league_ids_to_update
          .slice(i, i + batchSize)
          .map(async (league_id: string) => {
            const league = leagues.data.find(
              (league) => league.league_id === league_id
            ) as SleeperLeague;

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
                  edits
                );

                updated_matchups.push({
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
                  projection_current:
                    league.settings.best_ball === 1
                      ? projection_optimal
                      : projection_current,
                  projection_optimal,
                });
              });
            }
          })
      );
    }

    await upsertMatchups(updated_matchups);

    matchups = [...up_to_date_matchups, ...updated_matchups];

    return NextResponse.json({ matchups, schedule_week, projections_week });
  } catch (err: unknown) {
    return NextResponse.json({ err }, { status: 500 });
  }
}
