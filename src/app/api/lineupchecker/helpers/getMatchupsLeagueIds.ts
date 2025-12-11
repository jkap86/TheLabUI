import axiosInstance from "@/lib/axiosInstance";
import pool from "@/lib/pool";
import { SleeperLeague } from "@/lib/types/sleeperApiTypes";

export const getMatchupsLeagueIds = async (user_id: string) => {
  let league_ids: string[];

  try {
    const leagues: { data: SleeperLeague[] } = await axiosInstance.get(
      `https://api.sleeper.app/v1/user/${user_id}/leagues/nfl/${process.env.SEASON}`
    );

    const existingLeagueIdsQuery = `
      SELECT league_id
      FROM leagues
      WHERE league_id = any($1)
    `;

    const exisiting = await pool.query(existingLeagueIdsQuery, [
      leagues.data.map((l) => l.league_id),
    ]);

    const newLeagues = leagues.data.filter(
      (league) => !exisiting.rows.find((r) => r.league_id === league.league_id)
    );

    const upsertLeaguesQuery = `
      INSERT INTO leagues (league_id, name, avatar, season, status, settings, scoring_settings, roster_positions, rosters, updated_at)
      VALUES ${newLeagues
        .map(
          (_, i) =>
            `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${
              i * 10 + 4
            }, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${
              i * 10 + 8
            }, $${i * 10 + 9}, $${i * 10 + 10})`
        )
        .join(", ")}
      ON CONFLICT (league_id) DO UPDATE SET
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        season = EXCLUDED.season,
        status = EXCLUDED.status,
        settings = EXCLUDED.settings,
        scoring_settings = EXCLUDED.scoring_settings,
        roster_positions = EXCLUDED.roster_positions,
        updated_at = EXCLUDED.updated_at;
    `;

    const values = newLeagues.flatMap((league) => [
      league.league_id,
      league.name,
      league.avatar,
      league.season,
      league.status,
      league.settings,
      league.scoring_settings,
      JSON.stringify(league.roster_positions),
      JSON.stringify([]),
      new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    ]);

    if (newLeagues.length > 0) await pool.query(upsertLeaguesQuery, values);

    league_ids = leagues.data
      //.filter((l) => l.status === "in_season")
      .map((l) => l.league_id);

    return league_ids;
  } catch (err: unknown) {
    console.log({ err });
  }
};
