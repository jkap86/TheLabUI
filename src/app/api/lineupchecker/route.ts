import axiosInstance from "@/lib/axiosInstance";
import pool from "@/lib/pool";
import { Allplayer } from "@/lib/types/commonTypes";
import { MatchupDb } from "@/lib/types/dbTypes";
import {
  SleeperLeague,
  SleeperMatchup,
  SleeperRoster,
  SleeperUser,
} from "@/lib/types/sleeperApiTypes";
import { League, Matchup, Roster } from "@/lib/types/userTypes";
import { getOptimalStartersLineupCheck } from "@/utils/getOptimalStarters";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const searched = searchParams.get("searched");
  const week = searchParams.get("week") as string;

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
      SELECT m.*, l.name, l.avatar, l.scoring_settings, l.settings, l.rosters, l.roster_positions FROM matchups m 
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

        const { starters_optimal, projection_current, projection_optimal } =
          getOptimalStartersLineupCheck(
            allplayers,
            m.roster_positions,
            m.players,
            m.starters,
            projections_week,
            m.scoring_settings,
            schedule_week
          );
        const { rosters, ...up_to_date_matchup } = {
          ...m,
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
          projection_current,
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
                  schedule_week
                );

                updated_matchups.push({
                  ...m,
                  week: parseInt(week as string),
                  updated_at: new Date(),
                  league_id,
                  roster_id_user,
                  roster_id_opp,
                  username: user?.display_name || "Orphan",
                  avatar: user?.avatar || null,
                  league: {
                    index: leagues.data.findIndex(
                      (l) => l.league_id === league_id
                    ),
                    name: league.name,
                    avatar: league.avatar,
                    settings: league.settings,
                    scoring_settings: league.scoring_settings,
                    roster_positions: league.roster_positions,
                  },
                  starters_optimal,
                  projection_current,
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

const upsertMatchups = async (matchups: Matchup[]) => {
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

const getSchedule = async (week: string) => {
  const graphqlQuery = {
    query: `
            query batch_scores {
                scores(
                    sport: "nfl"
                    season_type: "regular"
                    season: "${process.env.SEASON}"
                    week: ${week}
                ) {
                    
                    game_id
                    metadata 
                    status
                    start_time
                }
            }
            `,
  };
  const schedule_week = await axiosInstance.post(
    "https://sleeper.com/graphql",
    graphqlQuery
  );

  const schedule_obj: { [team: string]: { kickoff: number; opp: string } } = {};

  schedule_week.data.data.scores.forEach(
    (game: {
      start_time: number;
      metadata: { away_team: string; home_team: string };
    }) => {
      schedule_obj[game.metadata.away_team] = {
        kickoff: game.start_time,
        opp: "@ " + game.metadata.home_team,
      };

      schedule_obj[game.metadata.home_team] = {
        kickoff: game.start_time,
        opp: "vs " + game.metadata.away_team,
      };
    }
  );

  return schedule_obj;
};

const getProjections = async (week: string) => {
  const projections: {
    data: { player_id: string; stats: { [cat: string]: number } }[];
  } = await axiosInstance.get(
    `https://api.sleeper.com/projections/nfl/${process.env.SEASON}/${week}?season_type=regular`
  );

  const projections_obj: { [player_id: string]: { [cat: string]: number } } =
    {};

  projections.data
    .filter((p) => p.stats.pts_ppr)
    .forEach((p) => {
      projections_obj[p.player_id] = p.stats;
    });

  return projections_obj;
};

const getAllplayers = async () => {
  const data = await pool.query(
    "SELECT * FROM common WHERE name = 'allplayers'"
  );

  const players_obj: { [player_id: string]: Allplayer } = {};

  data.rows[0].data
    .filter((player: Allplayer) => player.active)
    .forEach((player: Allplayer) => {
      players_obj[player.player_id] = player;
    });

  return players_obj;
};
