import pool from "@/lib/pool";
import { Matchup } from "@/lib/types/userTypes";

export const upsertMatchups = async (matchups: Matchup[]) => {
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
