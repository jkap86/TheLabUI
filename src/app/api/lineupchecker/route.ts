import axiosInstance from "@/lib/axiosInstance";
import pool from "@/lib/pool";
import { MatchupDb } from "@/lib/types/dbTypes";
import {
  SleeperLeague,
  SleeperMatchup,
  SleeperRoster,
} from "@/lib/types/sleeperApiTypes";
import { Roster } from "@/lib/types/userTypes";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const searched = searchParams.get("searched");
  const week = searchParams.get("week");

  let user_id;

  try {
    user_id = (
      await axiosInstance.get(`https://api.sleeper.app/v1/user/${searched}`)
    )?.data?.user_id;
  } catch (err: unknown) {
    console.log({ err });
  }

  if (!user_id) return NextResponse.json("Username not found", { status: 404 });

  let leagues;

  try {
    leagues = await axiosInstance.get(
      `https://api.sleeper.app/v1/user/${user_id}/leagues/nfl/${process.env.SEASON}`
    );
  } catch (err: unknown) {
    console.log({ err });
  }

  if (!leagues)
    return NextResponse.json("Error fetching user leagues", { status: 404 });

  const league_ids = leagues.data
    .filter((l: SleeperLeague) => l.status === "in_season")
    .map((l: SleeperLeague) => l.league_id);

  let matchups;

  try {
    const findMatchupsQuery = `
      SELECT m.*, l.rosters FROM matchups m 
      JOIN leagues AS l
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

        return {
          ...m,
          roster_id_user,
          roster_id_opp,
        };
      });

    const league_ids_to_update = league_ids.filter(
      (league_id: string) =>
        !up_to_date_matchups.some((m) => m.league_id === league_id)
    );

    const batchSize = 10;

    const updated_matchups: MatchupDb[] = [];

    for (let i = 0; i < league_ids_to_update.length; i += batchSize) {
      await Promise.all(
        league_ids_to_update
          .slice(i, i + batchSize)
          .map(async (league_id: string) => {
            const [matchups, rosters, users] = await Promise.all([
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

            const roster_id_user = rosters.data.find(
              (r: SleeperRoster) => r.owner_id === user_id
            )?.roster_id;

            const matchup_user = matchups.data.find(
              (m: SleeperMatchup) => m.roster_id === roster_id_user
            );

            const roster_id_opp = matchups.data.find(
              (m: SleeperMatchup) =>
                m.matchup_id === matchup_user?.matchup_id &&
                m.roster_id !== roster_id_user
            )?.roster_id;

            if (roster_id_user && roster_id_opp) {
              matchups.data.forEach((m: SleeperMatchup) => {
                updated_matchups.push({
                  ...m,
                  week: parseInt(week as string),
                  updated_at: new Date(),
                  league_id,
                  roster_id_user,
                  roster_id_opp,
                });
              });
            }
          })
      );
    }

    await upsertMatchups(updated_matchups);

    matchups = [...up_to_date_matchups, ...updated_matchups];

    return NextResponse.json(matchups);
  } catch (err: unknown) {
    return NextResponse.json(err);
  }
}

const upsertMatchups = async (matchups: MatchupDb[]) => {
  const upsertMatchupsQuery = `
    INSERT INTO matchups (week, matchup_id, roster_id, players, starters, league_id, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (week, roster_id, league_id) DO UPDATE SET
      matchup_id = EXCLUDED.matchup_id,
      players = EXCLUDED.players,
      starters = EXCLUDED.starters,
      updated_at = EXCLUDED.updated_at;
  `;

  for (const matchup of matchups) {
    try {
      await pool.query(upsertMatchupsQuery, [
        matchup.week,
        matchup.matchup_id,
        matchup.roster_id,
        matchup.players,
        matchup.starters,
        matchup.league_id,
        new Date(),
      ]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log({ err });
      }
    }
  }
};
